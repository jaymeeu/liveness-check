import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: Contact;
  sender?: Contact;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface AppState {
  balance: number;
  transactions: Transaction[];
  contacts: Contact[];
  user: {
    name: string;
    email: string;
    accountNumber: string;
  };
  security: {
    documentVerified: boolean;
    livenessVerified: boolean;
    lastDocumentUpload?: Date;
    lastLivenessCheck?: Date;
  };
}

type AppAction = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'UPDATE_TRANSACTION_STATUS'; payload: { id: string; status: 'completed' | 'pending' | 'failed' } }
  | { type: 'SET_DOCUMENT_VERIFIED'; payload: boolean }
  | { type: 'SET_LIVENESS_VERIFIED'; payload: boolean };

const initialState: AppState = {
  balance: 10900500.00,
  transactions: [
    {
      id: '1',
      type: 'received',
      amount: 1200.00,
      sender: { id: '1', name: 'John Smith', email: 'john@example.com', accountNumber: '1234567890' },
      description: 'Salary payment',
      date: new Date(2024, 11, 15),
      status: 'completed'
    },
    {
      id: '2',
      type: 'sent',
      amount: 300.00,
      recipient: { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', accountNumber: '0987654321' },
      description: 'Rent payment',
      date: new Date(2024, 11, 14),
      status: 'completed'
    },
    {
      id: '3',
      type: 'sent',
      amount: 50.00,
      recipient: { id: '3', name: 'Mike Davis', email: 'mike@example.com', accountNumber: '1122334455' },
      description: 'Dinner split',
      date: new Date(2024, 11, 13),
      status: 'completed'
    }
  ],
  contacts: [
    { id: '1', name: 'John Smith', email: 'john@example.com', accountNumber: '1234567890' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', accountNumber: '0987654321' },
    { id: '3', name: 'Mike Davis', email: 'mike@example.com', accountNumber: '1122334455' },
    { id: '4', name: 'Emily Chen', email: 'emily@example.com', accountNumber: '5566778899' },
    { id: '5', name: 'David Wilson', email: 'david@example.com', accountNumber: '9988776655' }
  ],
  user: {
    name: 'Alex Thompson',
    email: 'alex@example.com',
    accountNumber: '1111222233'
  },
  security: {
    documentVerified: false,
    livenessVerified: false
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      const newTransaction = action.payload;
      const balanceChange = newTransaction.type === 'sent' ? -newTransaction.amount : newTransaction.amount;
      return {
        ...state,
        transactions: [newTransaction, ...state.transactions],
        balance: state.balance + balanceChange
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.payload
      };
   
    case 'UPDATE_TRANSACTION_STATUS':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        )
      };
      case 'SET_DOCUMENT_VERIFIED':
        return {
          ...state,
          security: {
            ...state.security,
            documentVerified: action.payload,
            lastDocumentUpload: action.payload ? new Date() : state.security.lastDocumentUpload
          }
        };
      case 'SET_LIVENESS_VERIFIED':
        return {
          ...state,
          security: {
            ...state.security,
            livenessVerified: action.payload,
            lastLivenessCheck: action.payload ? new Date() : state.security.lastLivenessCheck
          }
        };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};