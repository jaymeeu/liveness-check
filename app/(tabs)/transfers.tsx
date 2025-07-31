import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { ArrowLeft, Search, Send, Shield, FileText, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { useApp, Contact } from '@/contexts/AppContext';
import { AppProvider } from '@/contexts/AppContext';
import DocumentUpload from '@/components/DocumentUpload';
import LivenessCheck from '@/components/LivenessCheck';
import { formatCurrency } from '@/utils';
import { useNotification } from '@/contexts/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';

function TransferContent() {
  const { state, dispatch } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'document' | 'liveness'>('select');
  // Add state to track pending transfer
  const [pendingTransfer, setPendingTransfer] = useState<null | {
    amount: string;
    description: string;
    selectedContact: Contact;
  }>(null);

  const { showNotification } = useNotification();

  const filteredContacts = state.contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setStep('amount');
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > state.balance) {
      showNotification('Insufficient funds', 'error');
      return;
    }
    setStep('confirm');
  };

  const handleTransfer = () => {
    if (!selectedContact || !amount) return;
    const transferAmount = parseFloat(amount);
    const requirement = getSecurityRequirement(transferAmount);
    if (requirement === 'liveness' && !state.security.livenessVerified) {
      setPendingTransfer({ amount, description, selectedContact });
      setStep('liveness');
      return;
    } else if (requirement === 'document' && !state.security.documentVerified) {
      setPendingTransfer({ amount, description, selectedContact });
      setStep('document');
      return;
    }
    // No check required or already verified, proceed
    completeTransfer(amount, description, selectedContact);
  };

  // Helper to complete the transfer
  const completeTransfer = (amount: string, description: string, selectedContact: Contact) => {
    // Simulate transfer process
    const transactionId = Date.now().toString();
    const newTransaction = {
      id: transactionId,
      type: 'sent' as const,
      amount: parseFloat(amount),
      recipient: selectedContact,
      description: description || 'Money transfer',
      date: new Date(),
      status: 'pending' as const
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_TRANSACTION_STATUS', 
        payload: { id: transactionId, status: 'completed' } 
      });
    }, 2000);
    setAmount('');
    setDescription('');
    setSelectedContact(null);
    setStep('select');
    setPendingTransfer(null);
    showNotification(`Transfer of ₦${amount} to ${selectedContact.name} is successfully!`, 'success');
  };

  // When document check is completed
  const handleDocumentComplete = () => {
    dispatch({ type: 'SET_DOCUMENT_VERIFIED', payload: true });
    if (pendingTransfer) {
      completeTransfer(pendingTransfer.amount, pendingTransfer.description, pendingTransfer.selectedContact);
    } else {
      setStep('confirm');
    }
  };

  // When liveness check is completed
  const handleLivenessComplete = () => {
    dispatch({ type: 'SET_LIVENESS_VERIFIED', payload: true });
    if (pendingTransfer) {
      completeTransfer(pendingTransfer.amount, pendingTransfer.description, pendingTransfer.selectedContact);
    } else {
      setStep('confirm');
    }
  };

  // If user cancels security check, return to confirm
  const handleSecurityCancel = () => {
    setStep('confirm');
    setPendingTransfer(null);
  };

 

  const getSecurityRequirement = (amount: number) => {
    if (amount >= 200) return 'liveness';
    if (amount >= 50) return 'document';
    return 'none';
  };

  const getSecurityIcon = (requirement: string) => {
    switch (requirement) {
      case 'liveness': return <Camera size={16} color="#F59E0B" />;
      case 'document': return <FileText size={16} color="#F59E0B" />;
      default: return <Shield size={16} color="#16A34A" />;
    }
  };

  const getSecurityText = (requirement: string) => {
    switch (requirement) {
      case 'liveness': return 'Liveness check required';
      case 'document': return 'Document verification required';
      default: return 'No additional verification needed';
    }
  };

  if (step === 'document') {
    return (
      <SafeAreaView style={styles.container}>
        <DocumentUpload
          onComplete={handleDocumentComplete}
          onCancel={handleSecurityCancel}
        />
      </SafeAreaView>
    );
  }

  if (step === 'liveness') {
    return (
      <LivenessCheck
        onComplete={handleLivenessComplete}
        onCancel={handleSecurityCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {step !== 'select' && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (step === 'confirm') setStep('amount');
              else if (step === 'amount') setStep('select');
            }}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {step === 'select' ? 'Send Money' : 
           step === 'amount' ? 'Enter Amount' : 'Confirm Transfer'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {step === 'select' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(state.balance)}</Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                onPress={() => handleContactSelect(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactEmail}>{contact.email}</Text>
                  <Text style={styles.contactAccount}>
                    Account: {contact.accountNumber}
                  </Text>
                </View>
                <Send size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {step === 'amount' && (
        <View style={styles.amountContainer}>
          <View style={styles.recipientInfo}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientAvatarText}>
                {selectedContact?.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View>
              <Text style={styles.recipientName}>{selectedContact?.name}</Text>
              <Text style={styles.recipientAccount}>
                Account: {selectedContact?.accountNumber}
              </Text>
            </View>
          </View>

          <View style={styles.amountInput}>
            <Text style={styles.nairaSign}>₦</Text>
            <TextInput
              style={styles.amountText}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
              placeholderTextColor="#D1D5DB"
            />
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a note (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.availableBalance}>
            <Text style={styles.availableBalanceText}>
              Available: {formatCurrency(state.balance)}
            </Text>
          </View>

          {/* Security Requirement Indicator */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.securityIndicator}>
              <View style={styles.securityInfo}>
                {getSecurityIcon(getSecurityRequirement(parseFloat(amount)))}
                <Text style={styles.securityText}>
                  {getSecurityText(getSecurityRequirement(parseFloat(amount)))}
                </Text>
              </View>
              {getSecurityRequirement(parseFloat(amount)) !== 'none' && (
                <Text style={styles.securityNote}>
                  {getSecurityRequirement(parseFloat(amount)) === 'liveness' 
                    ? 'Transfers above $200 require liveness verification'
                    : 'Transfers $50-$200 require document verification'
                  }
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextButton, (!amount || parseFloat(amount) <= 0) && styles.nextButtonDisabled]}
            onPress={handleAmountNext}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'confirm' && (
        <View style={styles.confirmContainer}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              {/* <Text style={styles.confirmTitle}>Confirm Transfer</Text> */}
              <Text style={styles.confirmAmount}>
                {formatCurrency(parseFloat(amount))}
              </Text>
            </View>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>To</Text>
                <Text style={styles.confirmValue}>{selectedContact?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Account</Text>
                <Text style={styles.confirmValue}>{selectedContact?.accountNumber}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Description</Text>
                <Text style={styles.confirmValue}>
                  {description || 'Money transfer'}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Fee</Text>
                <Text style={styles.confirmValue}>Free</Text>
              </View>
            </View>

            <View style={styles.confirmTotal}>
              <Text style={styles.confirmTotalLabel}>Total Amount</Text>
              <Text style={styles.confirmTotalValue}>
                {formatCurrency(parseFloat(amount))}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleTransfer}
          >
            <Text style={styles.sendButtonText}>Send Money</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function TransferScreen() {
  return (
    <AppProvider>
       <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.gradient}
    >
      <TransferContent />

    </LinearGradient>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  contactsList: {
    // backgroundColor: '#1e293b',
    marginHorizontal: 20,
    // borderRadius: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    // paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F3F4F6',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#112e8f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  contactAccount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipientAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  recipientName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  nairaSign: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#959aa5',
    textAlign: 'center',
  },
  amountText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 8,
    textAlign: 'center',
    minWidth: 200,
  },
  descriptionInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  availableBalance: {
    alignItems: 'center',
    marginBottom: 40,
  },
  availableBalanceText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
  },
  securityIndicator: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginLeft: 8,
  },
  securityNote: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  nextButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  confirmContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  confirmCard: {
    // backgroundColor: '#1e293b',
    borderRadius: 16,
    // padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  confirmAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#4f74ee',
  },
  confirmDetails: {
    marginBottom: 24,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
  },
  confirmValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  confirmTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmTotalLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  confirmTotalValue: {
    fontSize: 18,
    color: '#4f74ee',
    fontFamily: 'Inter-Bold',
  },
  sendButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});