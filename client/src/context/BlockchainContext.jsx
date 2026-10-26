import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import {
  walletApi,
  transactionApi,
  blockApi,
  chainApi,
  statsApi,
} from '../services/api';

const initialState = {
  wallets: [],
  blocks: [],
  mempool: [],
  stats: {},
  chainStatus: {},
  validation: {},
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
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
      return { ...state, blocks: [action.payload, ...state.blocks] };
    case 'ADD_TRANSACTION':
      return { ...state, mempool: [action.payload, ...state.mempool] };
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

  const setLoading = useCallback((v) => dispatch({ type: 'SET_LOADING', payload: v }), []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadWallets(), loadBlocks(), loadMempool(), loadStats(), loadChainStatus(), loadValidation()]);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const loadWallets = useCallback(async () => {
    const data = await walletApi.list();
    dispatch({ type: 'SET_WALLETS', payload: data });
  }, []);

  const loadBlocks = useCallback(async () => {
    const data = await blockApi.list();
    dispatch({ type: 'SET_BLOCKS', payload: data });
  }, []);

  const loadMempool = useCallback(async () => {
    const data = await transactionApi.mempool();
    dispatch({ type: 'SET_MEMPOOL', payload: data });
  }, []);

  const loadStats = useCallback(async () => {
    const data = await statsApi.get();
    dispatch({ type: 'SET_STATS', payload: data });
  }, []);

  const loadChainStatus = useCallback(async () => {
    const data = await chainApi.status();
    dispatch({ type: 'SET_CHAIN_STATUS', payload: data });
  }, []);

  const loadValidation = useCallback(async () => {
    const data = await chainApi.validate();
    dispatch({ type: 'SET_VALIDATION', payload: data });
  }, []);

  const createWallet = useCallback(async (name) => {
    const w = await walletApi.create(name);
    dispatch({ type: 'ADD_WALLET', payload: w });
    await loadStats();
    return w;
  }, [loadStats]);

  const createTransaction = useCallback(async (tx) => {
    const created = await transactionApi.create(tx);
    dispatch({ type: 'ADD_TRANSACTION', payload: created });
    await loadStats();
    await loadMempool();
    return created;
  }, [loadStats, loadMempool]);

  const mineBlock = useCallback(async (data) => {
    const block = await blockApi.mine(data);
    dispatch({ type: 'ADD_BLOCK', payload: block });
    await loadBlocks();
    await loadMempool();
    await loadStats();
    await loadChainStatus();
    await loadValidation();
    return block;
  }, [loadBlocks, loadMempool, loadStats, loadChainStatus, loadValidation]);

  const resetChain = useCallback(async (data) => {
    const result = await chainApi.reset(data);
    dispatch({ type: 'SET_BLOCKS', payload: [result.block] });
    dispatch({ type: 'SET_MEMPOOL', payload: [] });
    await loadStats();
    await loadWallets();
    await loadChainStatus();
    await loadValidation();
    return result;
  }, [loadStats, loadWallets, loadChainStatus, loadValidation]);

  useEffect(() => {
    loadAll();
    // Poll for updates
    const interval = setInterval(loadAll, 4000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const removeTransaction = useCallback(async (id) => {
    await transactionApi.remove(id);
    dispatch({ type: 'REMOVE_TRANSACTION', payload: id });
    await loadStats();
    await loadMempool();
  }, [loadStats, loadMempool]);

  const value = {
    ...state,
    loadAll,
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
  };

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error('useBlockchain must be used within BlockchainProvider');
  return ctx;
}
