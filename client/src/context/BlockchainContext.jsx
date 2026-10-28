import { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import {
  walletApi,
  transactionApi,
  blockApi,
  chainApi,
  statsApi,
  getErrorMessage,
} from '../services/api';

const initialState = {
  wallets: [],
  blocks: [],
  mempool: [],
  stats: {},
  chainStatus: {},
  validation: { valid: true, results: [] },
  initialLoading: true,
  actionLoading: false,
  isMining: false,
  isResetting: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_LOADING':
      return { ...state, initialLoading: action.payload };
    case 'SET_ACTION_LOADING':
      return { ...state, actionLoading: action.payload };
    case 'SET_MINING':
      return { ...state, isMining: action.payload };
    case 'SET_RESETTING':
      return { ...state, isResetting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload };
    case 'SET_MEMPOOL':
      return { ...state, mempool: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_CHAIN_STATUS':
      return { ...state, chainStatus: action.payload };
    case 'SET_VALIDATION':
      return { ...state, validation: action.payload };
    case 'ADD_WALLET':
      return { ...state, wallets: [action.payload, ...state.wallets] };
    case 'ADD_BLOCK':
      return { ...state, blocks: [...state.blocks, action.payload] };
    case 'ADD_TRANSACTION':
      return { ...state, mempool: [...state.mempool, action.payload] };
    case 'REMOVE_TRANSACTION':
      return {
        ...state,
        mempool: state.mempool.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

export const BlockchainContext = createContext(null);

export function BlockchainProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadWallets = useCallback(async () => {
    try {
      const data = await walletApi.list();
      dispatch({ type: 'SET_WALLETS', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load wallets:', e);
      return [];
    }
  }, []);

  const loadBlocks = useCallback(async () => {
    try {
      const data = await blockApi.list();
      dispatch({ type: 'SET_BLOCKS', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load blocks:', e);
      return [];
    }
  }, []);

  const loadMempool = useCallback(async () => {
    try {
      const data = await transactionApi.mempool();
      dispatch({ type: 'SET_MEMPOOL', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load mempool:', e);
      return [];
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await statsApi.get();
      dispatch({ type: 'SET_STATS', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load stats:', e);
      return {};
    }
  }, []);

  const loadChainStatus = useCallback(async () => {
    try {
      const data = await chainApi.status();
      dispatch({ type: 'SET_CHAIN_STATUS', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load chain status:', e);
      return {};
    }
  }, []);

  const loadValidation = useCallback(async () => {
    try {
      const data = await chainApi.validate();
      dispatch({ type: 'SET_VALIDATION', payload: data });
      return data;
    } catch (e) {
      console.error('Failed to load chain validation:', e);
      return { valid: false, results: [] };
    }
  }, []);

  // Fetch all data without toggling interactive action loading
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        loadWallets(),
        loadBlocks(),
        loadMempool(),
        loadStats(),
        loadChainStatus(),
        loadValidation(),
      ]);
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      console.error('Silent refresh failed:', err);
    }
  }, [loadWallets, loadBlocks, loadMempool, loadStats, loadChainStatus, loadValidation]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const initialFetch = async () => {
      try {
        await refreshAll();
      } finally {
        if (mounted) dispatch({ type: 'SET_INITIAL_LOADING', payload: false });
      }
    };
    initialFetch();

    // Silent background poll every 4 seconds
    const interval = setInterval(refreshAll, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshAll]);

  const createWallet = useCallback(async (name, emoji) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const w = await walletApi.create(name, emoji);
      dispatch({ type: 'ADD_WALLET', payload: w });
      await Promise.all([loadWallets(), loadStats()]);
      addToast('success', 'Wallet Created', `Successfully generated identity for ${w.name}`);
      return w;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Wallet Creation Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadWallets, loadStats, addToast]);

  const createTransaction = useCallback(async (txData) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const created = await transactionApi.create(txData);
      dispatch({ type: 'ADD_TRANSACTION', payload: created });
      await Promise.all([loadMempool(), loadStats()]);
      addToast('success', 'Transaction Broadcasted', `Sent ${created.amount} DMC to mempool`);
      return created;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Transaction Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadMempool, loadStats, addToast]);

  const removeTransaction = useCallback(async (id) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      await transactionApi.remove(id);
      dispatch({ type: 'REMOVE_TRANSACTION', payload: id });
      await Promise.all([loadMempool(), loadStats()]);
      addToast('info', 'Mempool Updated', 'Pending transaction dropped from mempool');
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Remove Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadMempool, loadStats, addToast]);

  const mineBlock = useCallback(async (data) => {
    dispatch({ type: 'SET_MINING', payload: true });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const block = await blockApi.mine(data);
      dispatch({ type: 'ADD_BLOCK', payload: block });
      await Promise.all([
        loadBlocks(),
        loadMempool(),
        loadWallets(),
        loadStats(),
        loadChainStatus(),
        loadValidation(),
      ]);
      addToast('success', `Block #${block.index} Mined!`, `Earned ${block.reward || 50} DMC coinbase reward`);
      return block;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Mining Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_MINING', payload: false });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadBlocks, loadMempool, loadWallets, loadStats, loadChainStatus, loadValidation, addToast]);

  const resetChain = useCallback(async (data) => {
    dispatch({ type: 'SET_RESETTING', payload: true });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const result = await chainApi.reset(data);
      dispatch({ type: 'SET_BLOCKS', payload: [result.block] });
      dispatch({ type: 'SET_MEMPOOL', payload: [] });
      await Promise.all([
        loadStats(),
        loadWallets(),
        loadChainStatus(),
        loadValidation(),
      ]);
      addToast('info', 'Chain Reset', 'Reset network to fresh Genesis state');
      return result;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Reset Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_RESETTING', payload: false });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadStats, loadWallets, loadChainStatus, loadValidation, addToast]);

  const tamperChain = useCallback(async (tamperData) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const result = await chainApi.tamper(tamperData);
      await Promise.all([loadBlocks(), loadValidation(), loadChainStatus()]);
      addToast('error', 'Chain Tampered!', result.message);
      return result;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Tamper Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadBlocks, loadValidation, loadChainStatus, addToast]);

  const repairChain = useCallback(async () => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const result = await chainApi.repair();
      await Promise.all([loadBlocks(), loadValidation(), loadChainStatus(), loadStats()]);
      addToast('success', 'Chain Repaired', result.message);
      return result;
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', 'Repair Failed', msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [loadBlocks, loadValidation, loadChainStatus, loadStats, addToast]);

  const value = {
    ...state,
    // Provide backwards-compatible loading prop
    loading: state.actionLoading,
    toasts,
    addToast,
    removeToast,
    refreshAll,
    loadWallets,
    loadBlocks,
    loadMempool,
    loadStats,
    loadChainStatus,
    loadValidation,
    createWallet,
    createTransaction,
    removeTransaction,
    mineBlock,
    resetChain,
    tamperChain,
    repairChain,
  };

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error('useBlockchain must be used within BlockchainProvider');
  return ctx;
}
