import { LinearGradient } from 'expo-linear-gradient';
import {
  Building,
  Camera,
  Clock,
  CreditCard,
  Gift,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import CameraFeature from '../../components/CameraFeature';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const activityData = [
  {
    type: 'transaction',
    icon: { type: 'initials', initials: 'WK', color: '#f10f0f' },
    // icon: { type: 'image', source: { uri: 'https://placehold.co/40x40/a9a9a9/ffffff?text=W' } }, // Placeholder for 'Work'
    title: 'Work',
    subtitle: 'Tomorrow',
    amount: '+1,234.56',
    isCredit: true,
  },
  {
    type: 'transaction',
    icon: { type: 'initials', initials: 'UB', color: '#000' },
    title: 'Uber',
    subtitle: '26.00',
    amount: '26.00',
  },
  {
    type: 'transaction',
    icon: { type: 'initials', initials: 'TL', color: '#4a4711' },
    title: 'Transport for London',
    subtitle: 'Travel charge for Wed, 1 Jan',
    amount: '5.80',
  },
  {
    type: 'transaction',
    icon: { type: 'initials', initials: 'GR', color: '#8bc34a' },
    title: 'G Robertson',
    subtitle: '"Thanks for dinner xx"',
    amount: '+12.00',
    isCredit: true,
  },
  {
    type: 'transaction',
    icon: { type: 'initials', initials: 'NT', color: '#2a4487' },
    title: 'NOW TV',
    subtitle: '35% cashback',
    amount: '+8.40',
    isCredit: true,
  },
];

const renderIcon = (item: any) => {
  if (item.icon.type === 'image') {
    return <Image source={item.icon.source} style={styles.transactionIconImage} />;
  }
  if (item.icon.type === 'initials') {
    return (
      <View style={[styles.transactionIconInitials, { backgroundColor: item.icon.color }]}>
        <Text style={styles.transactionIconInitialsText}>{item.icon.initials}</Text>
      </View>
    );
  }
  return <View style={styles.transactionIconPlaceholder} />;
};


const WalletCard = () => (
  <View style={styles.walletCard}>
    <View style={styles.walletCardHeader}>
      <View>
        <Text style={styles.walletCardBank}>Melly Bank</Text>
        <Text style={styles.walletCardAccount}>04-00-04 • 12345678</Text>
      </View>
      <View style={styles.walletCardBalanceContainer}>
        <Text style={styles.walletCardBalance}>£1,234.56</Text>
        <Text style={styles.walletCardBalanceLabel}>Balance</Text>
      </View>
    </View>
    <View style={styles.walletCardActions}>
      <View style={styles.walletCardButtons}>
        <TouchableOpacity style={styles.walletCardButton}>
          <Plus size={16} stroke="#e06262" />
          <Text style={styles.walletCardButtonText}>Add money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.walletCardButton}>
          <CreditCard size={16} stroke="#e84545" />
          <Text style={styles.walletCardButtonText}>Card</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.walletCardMoreButton}>
        <MoreHorizontal size={20} stroke="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const ActivityList = () => (
  <View style={styles.activityListContainer}>
    <View style={styles.activityListHeader}>
      <Text style={styles.activityListTitle}>Activity</Text>
      <TouchableOpacity>
        <MoreHorizontal size={22} stroke="#9ca3af" />
      </TouchableOpacity>
    </View>
    {activityData.map((item, index) => {
      if (item.type === 'upcoming') {
        return (
          <View key={index} style={styles.activityUpcomingItem}>
            {renderIcon(item)}
            <View style={styles.activityListDetails}>
              <Text style={styles.activityListItemTitle}>{item.title}</Text>
              <Text style={styles.activityListItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.activityUpcomingAmount}>{item.amount}</Text>
          </View>
        );
      }
      return (
        <View key={index} style={styles.activityListItem}>
          {renderIcon(item)}
          <View style={styles.activityListDetails}>
            <Text style={styles.activityListItemTitle}>{item.title}</Text>
            <Text style={styles.activityListItemSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={[styles.activityListAmount, item.isCredit ? styles.activityListCredit : styles.activityListDebit]}>
            {item.isCredit ? '+' : '-'}£{item.amount.replace(/^[+-]/, '')}
          </Text>
        </View>
      );
    })}
  </View>
);

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraComplete = (result: any) => {
    setShowCamera(false);
    // Handle camera result
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraFeature
        onComplete={handleCameraComplete}
        onCancel={handleCameraCancel}
        title="Document Scanner"
        description="Scan your documents for verification"
      />
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileText}>AA</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Plus size={16} stroke="#ffffff" />
              <Text style={styles.upgradeText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Gift size={20} stroke="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Search size={20} stroke="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setShowCamera(true)}
            >
              <Camera size={20} stroke="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Plus size={20} stroke="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>


        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >

          <View style={[styles.statsContainer]}>

            {/* Financial Stats */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH * 0.8}
              snapToAlignment="start"
            >
              <View style={styles.statItem}>
                <Building size={16} stroke="#64748b" />
                <Text style={styles.statAmount}>£3,511.20</Text>
                <Text style={styles.statLabel}>Personal balance</Text>
                <View style={styles.statIcons}>
                  <View style={[styles.iconBadge, { backgroundColor: '#8b5cf6' }]} />
                  <View style={[styles.iconBadge, { backgroundColor: '#f97316' }]} />
                  <Text style={styles.iconCount}>+2</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={16} stroke="#64748b" />
                <Text style={styles.statAmount}>£3,919.57</Text>
                <Text style={styles.statLabel}>Spent this month</Text>
                <View style={styles.statIcons}>
                  <View style={[styles.iconBadge, { backgroundColor: '#ffffff' }]} />
                  <View style={[styles.iconBadge, { backgroundColor: '#ec4899' }]} />
                  <Text style={styles.iconCount}>+3</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} stroke="#64748b" />
                <Text style={styles.statAmount}>£24.34</Text>
                <Text style={styles.statLabel}>Left to spend</Text>
                <Text style={styles.statDate}>Until 31st July</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={16} stroke="#64748b" />
                <Text style={styles.statAmount}>£1,245.80</Text>
                <Text style={styles.statLabel}>Saved this month</Text>
                <View style={styles.statIcons}>
                  <View style={[styles.iconBadge, { backgroundColor: '#10b981' }]} />
                  <View style={[styles.iconBadge, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.iconCount}>+1</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Building size={16} stroke="#64748b" />
                <Text style={styles.statAmount}>£892.15</Text>
                <Text style={styles.statLabel}>Investments</Text>
                <Text style={styles.statDate}>+12.5% this year</Text>
              </View>
            </ScrollView>
          </View>

          {/* Investment Banner - now horizontal scrollable */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.investmentScrollContent}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            style={{ marginBottom: 8 }}
          >
            {/* Example: duplicate the banner for demo */}
            {[1,2,3].map((_, idx) => (
              <View style={[styles.investmentBanner, { width: SCREEN_WIDTH - 40 }]} key={idx}>
                <View style={styles.investmentIcon}>
                  <TrendingUp size={20} stroke="#60a5fa" />
                </View>
                <View style={styles.investmentContent}>
                  <Text style={styles.investmentTitle}>New investments landed</Text>
                  <Text style={styles.investmentSubtitle}>
                    See a new range of funds
                  </Text>
                </View>
                <TouchableOpacity>
                  <MoreHorizontal size={20} stroke="#64748b" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <WalletCard />
          <ActivityList />
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  upgradeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  notificationInfo: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsScrollContent: {
    paddingRight: 20,
  },
  statItem: {
    width: SCREEN_WIDTH * 0.32,
    marginRight: 16,
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 8,

  },
  statAmount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  statDate: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  statIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  iconBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  iconCount: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 4,
  },
  investmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  investmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  investmentContent: {
    flex: 1,
  },
  investmentTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  investmentSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  investmentScrollContent: {
    // paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },


  activitySection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },



  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionContent: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#e84545',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardBank: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardAccount: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  cardBalanceContainer: {
    alignItems: 'flex-end',
  },
  cardBalance: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardBalanceLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  buttonText: {
    color: '#e84545',
    fontWeight: 'bold',
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  // Activity List Styles
  activityContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Item Styles
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionIconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  transactionIconInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconInitialsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  upcomingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  creditAmount: {
    color: '#10b981',
  },
  walletCard: {
    backgroundColor: '#e84545',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  walletCardBank: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  walletCardAccount: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  walletCardBalanceContainer: {
    alignItems: 'flex-end',
  },
  walletCardBalance: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  walletCardBalanceLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
  },
  walletCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletCardButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  walletCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginRight: 10,
  },
  walletCardButtonText: {
    color: '#e84545',
    fontWeight: 'bold',
    fontSize: 14,
  },
  walletCardMoreButton: {
    padding: 4,
  },
  activityListContainer: {
    // backgroundColor: '#16213e',
    marginHorizontal: 20,
    // borderRadius: 18,
    // padding: 20,
    marginTop: 18,
    marginBottom: 16,
  },
  activityListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  activityListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityUpcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityUpcomingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityListDetails: {
    flex: 1,
  },
  activityListItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  activityListItemSubtitle: {
    fontSize: 14,
    color: '#959ca9',
    marginTop: 2,
  },
  activityListAmount: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  activityListCredit: {
    color: '#10b981',
  },
  activityListDebit: {
    color: '#fff',
  },
  statsHandle: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  statsHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#64748b',
    opacity: 0.5,
  },
});