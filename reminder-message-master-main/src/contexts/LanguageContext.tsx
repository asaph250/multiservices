
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'rw';
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'rw') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'createMessage': 'Create Message',
    'customers': 'Customers',
    'subscription': 'Subscription',
    'logout': 'Logout',
    'welcome': 'Welcome',
    
    // Dashboard
    'quickActions': 'Quick Actions',
    'scheduleNewCampaigns': 'Schedule new campaigns',
    'manageContactLists': 'Manage contact lists',
    'viewAllCampaigns': 'View all campaigns',
    'upgradePlan': 'Upgrade plan',
    'totalCustomers': 'Total Customers',
    'messagesSentThisWeek': 'Messages Sent This Week',
    'deliverySuccessRate': 'Delivery Success Rate',
    'upcomingScheduledMessages': 'Upcoming Scheduled Messages',
    'messagesReadyToBeSent': 'Messages ready to be sent',
    'messageHistory': 'Message History',
    'yourRecentMessages': 'Your recent messages',
    'recentCampaigns': 'Recent Campaigns',
    'yourLatestSentMessages': 'Your latest sent messages',
    'delivered': 'delivered',
    'recipients': 'recipients',
    'edit': 'Edit',
    
    // Create Message
    'createNewMessage': 'Create New Message',
    'backToDashboard': 'Back to Dashboard',
    'messageDetails': 'Message Details',
    'chooseMessageTypeAndContent': 'Choose your message type and content',
    'messageType': 'Message Type',
    'selectMessageType': 'Select message type',
    'generalSale': 'General Sale',
    'flashSale': 'Flash Sale',
    'specialOffer': 'Special Offer',
    'holidayGreeting': 'Holiday Greeting',
    'birthdayMessage': 'Birthday Message',
    'messageContent': 'Message Content',
    'generateWithAI': 'Generate with AI',
    'generating': 'Generating...',
    'writeMessageHere': 'Write your message here or use AI to generate one...',
    'characters': 'characters',
    'scheduleDelivery': 'Schedule Delivery',
    'whenShouldMessageBeSent': 'When should this message be sent?',
    'date': 'Date',
    'time': 'Time',
    'customerList': 'Customer List',
    'addCustomerContacts': 'Add customer contacts (WhatsApp numbers or Instagram usernames)',
    'enterContactsSeparated': 'Enter contacts separated by commas or new lines:\n+1234567890, @instagram_user, +9876543210',
    'separateContactsWithCommas': 'Separate contacts with commas or new lines',
    'manageSavedCustomerLists': 'Manage saved customer lists →',
    'cancel': 'Cancel',
    'scheduleMessage': 'Schedule Message',
    'generateSampleSalesMessage': 'Generate Sample Sales Message',
    
    // Customers
    'addNewCustomer': 'Add New Customer',
    'customerName': 'Customer Name',
    'phoneNumber': 'Phone Number',
    'segment': 'Segment (Optional)',
    'addCustomer': 'Add Customer',
    'yourCustomers': 'Your Customers',
    'name': 'Name',
    'phone': 'Phone',
    'actions': 'Actions',
    'delete': 'Delete',
    'noCustomersYet': 'No customers yet. Add your first customer above.',
    
    // Subscription
    'subscriptionPlans': 'Subscription Plans',
    'chooseYourPlan': 'Choose your plan',
    'paymentInstructions': 'Payment Instructions',
    'mobileMoneyMTN': 'Mobile Money (MTN)',
    'mobileMoneyAirtel': 'Mobile Money (Airtel)',
    'bankAccount': 'Bank Account',
    'bankOfKigali': 'Bank of Kigali',
    'accountNumber': 'Account Number',
    'accountName': 'Account Name',
    'businessAccount': 'Business Account',
    'afterPayment': 'After Payment',
    'sendProofViaWhatsApp': 'Send proof of payment via WhatsApp to',
    'orUploadScreenshot': 'Or upload a screenshot of your payment below',
    'uploadPaymentProof': 'Upload Payment Proof',
    'chooseFile': 'Choose file',
    'basicPlan': 'Basic Plan',
    'proPlan': 'Pro Plan',
    'vipPlan': 'VIP Plan',
    'rwfMonth': 'RWF/month',
    'messagePerWeek': 'message per week',
    'messagesPerWeek': 'messages per week',
    'dailyMessaging': 'Daily messaging',
    'selectPlan': 'Select Plan',
    
    // Toast messages
    'aiMessageGenerated': 'AI message generated!',
    'messageHasBeenCreated': 'Your message has been created. Feel free to edit it as needed.',
    'pleaseSelectMessageType': 'Please select a message type',
    'chooseMessageTypeBeforeGenerating': 'Choose a message type before generating AI content.',
    'messageScheduledSuccessfully': 'Message scheduled successfully!',
    'yourMessageHasBeenScheduled': 'Your message has been scheduled for',
    'customerAddedSuccessfully': 'Customer added successfully!',
    'customerDeletedSuccessfully': 'Customer deleted successfully!',
    'customerUpdatedSuccessfully': 'Customer updated successfully!',
    
    // Status
    'scheduled': 'Scheduled',
    'sent': 'Sent',
    'failed': 'Failed',
    'status': 'Status',
    'scheduledFor': 'Scheduled for',
    'sentOn': 'Sent on',
    'noMessagesYet': 'No messages yet. Create your first message!',
  },
  rw: {
    // Navigation
    'dashboard': 'Ikibaho',
    'createMessage': 'Kora Ubutumwa',
    'customers': 'Abakiriya',
    'subscription': 'Kwiyandikisha',
    'logout': 'Gusohoka',
    'welcome': 'Murakaza neza',
    
    // Dashboard
    'quickActions': 'Ibikorwa Byihuse',
    'scheduleNewCampaigns': 'Tegura ubukangurambaga bushya',
    'manageContactLists': 'Gucunga urutonde rw\'abo muvugana',
    'viewAllCampaigns': 'Kureba ubukangurambaga bwose',
    'upgradePlan': 'Kuzamura gahunda',
    'totalCustomers': 'Abakiriya Bose',
    'messagesSentThisWeek': 'Ubutumwa Bwoherejwe Iri Cyumweru',
    'deliverySuccessRate': 'Igipimo cy\'Ubutumwa Bugeze',
    'upcomingScheduledMessages': 'Ubutumwa Bwateganijwe',
    'messagesReadyToBeSent': 'Ubutumwa buteguye koherezwa',
    'messageHistory': 'Amateka y\'Ubutumwa',
    'yourRecentMessages': 'Ubutumwa bwawe bwa vuba',
    'recentCampaigns': 'Ubukangurambaga Bwa Vuba',
    'yourLatestSentMessages': 'Ubutumwa bwawe bwanyuma bwoherejwe',
    'delivered': 'bwageze',
    'recipients': 'abakira',
    'edit': 'Guhindura',
    
    // Create Message
    'createNewMessage': 'Kora Ubutumwa Bushya',
    'backToDashboard': 'Garuka ku Kibaho',
    'messageDetails': 'Amakuru y\'Ubutumwa',
    'chooseMessageTypeAndContent': 'Hitamo ubwoko bw\'ubutumwa n\'ibiri murimo',
    'messageType': 'Ubwoko bw\'Ubutumwa',
    'selectMessageType': 'Hitamo ubwoko bw\'ubutumwa',
    'generalSale': 'Icyacuruzwa Rusange',
    'flashSale': 'Icyacuruzwa Gito',
    'specialOffer': 'Icyapa Kidasanzwe',
    'holidayGreeting': 'Iramuka ry\'Iminsi Mikuru',
    'birthdayMessage': 'Ubutumwa bw\'Isabukuru',
    'messageContent': 'Ibiri mu Butumwa',
    'generateWithAI': 'Kora hamwe na AI',
    'generating': 'Gukora...',
    'writeMessageHere': 'Andika ubutumwa hano cyangwa ukoreshe AI kukora...',
    'characters': 'inyuguti',
    'scheduleDelivery': 'Tegura Kohereza',
    'whenShouldMessageBeSent': 'Ni ryari ubu butumwa bukoherezwa?',
    'date': 'Itariki',
    'time': 'Isaha',
    'customerList': 'Urutonde rw\'Abakiriya',
    'addCustomerContacts': 'Ongeraho abo muvugana (nimero za WhatsApp cyangwa amazina ya Instagram)',
    'enterContactsSeparated': 'Injiza abo muvugana batandukanyije n\'akabago cyangwa imirongo:\n+1234567890, @instagram_user, +9876543210',
    'separateContactsWithCommas': 'Tandukanya abo muvugana ukoreshe akabago cyangwa imirongo',
    'manageSavedCustomerLists': 'Gucunga urutonde rw\'abakiriya bwabitswe →',
    'cancel': 'Kureka',
    'scheduleMessage': 'Tegura Ubutumwa',
    'generateSampleSalesMessage': 'Kora Urugero rw\'Ubutumwa bw\'Icyacuruzwa',
    
    // Customers
    'addNewCustomer': 'Ongeraho Umukiriya Mushya',
    'customerName': 'Izina ry\'Umukiriya',
    'phoneNumber': 'Nimero ya Telefoni',
    'segment': 'Igice (Bitegetswe)',
    'addCustomer': 'Ongeraho Umukiriya',
    'yourCustomers': 'Abakiriya Bwanyu',
    'name': 'Izina',
    'phone': 'Telefoni',
    'actions': 'Ibikorwa',
    'delete': 'Gusiba',
    'noCustomersYet': 'Nta bakiriya uracyafite. Ongeraho uwawe wa mbere hejuru.',
    
    // Subscription
    'subscriptionPlans': 'Gahunda zo Kwiyandikisha',
    'chooseYourPlan': 'Hitamo gahunda yawe',
    'paymentInstructions': 'Amabwiriza yo Kwishyura',
    'mobileMoneyMTN': 'Mobile Money (MTN)',
    'mobileMoneyAirtel': 'Mobile Money (Airtel)',
    'bankAccount': 'Konti ya Banki',
    'bankOfKigali': 'Banki y\'u Rwanda',
    'accountNumber': 'Nimero ya Konti',
    'accountName': 'Izina rya Konti',
    'businessAccount': 'Konti y\'Ubucuruzi',
    'afterPayment': 'Nyuma yo Kwishyura',
    'sendProofViaWhatsApp': 'Ohereza ikimenyetso cy\'ubwishyu kuri WhatsApp',
    'orUploadScreenshot': 'Cyangwa ushyire ifoto y\'ubwishyu hano munsi',
    'uploadPaymentProof': 'Shyira Ikimenyetso cy\'Ubwishyu',
    'chooseFile': 'Hitamo dosiye',
    'basicPlan': 'Gahunda y\'Ibanze',
    'proPlan': 'Gahunda Nziza',
    'vipPlan': 'Gahunda Nkuru',
    'rwfMonth': 'RWF/ukwezi',
    'messagePerWeek': 'ubutumwa ku cyumweru',
    'messagesPerWeek': 'ubutumwa ku cyumweru',
    'dailyMessaging': 'Ubutumwa bwa buri munsi',
    'selectPlan': 'Hitamo Gahunda',
    
    // Toast messages
    'aiMessageGenerated': 'Ubutumwa bwa AI bwarakozwe!',
    'messageHasBeenCreated': 'Ubutumwa bwawe bwarakozwe. Ushobora kubuhindura nkuko bishaka.',
    'pleaseSelectMessageType': 'Nyamuneka hitamo ubwoko bw\'ubutumwa',
    'chooseMessageTypeBeforeGenerating': 'Hitamo ubwoko bw\'ubutumwa mbere yo gukora ibiri muri AI.',
    'messageScheduledSuccessfully': 'Ubutumwa bwateganijwe neza!',
    'yourMessageHasBeenScheduled': 'Ubutumwa bwawe bwateganijwe kuri',
    'customerAddedSuccessfully': 'Umukiriya yongerewe neza!',
    'customerDeletedSuccessfully': 'Umukiriya yasibwe neza!',
    'customerUpdatedSuccessfully': 'Umukiriya yahinduwe neza!',
    
    // Status
    'scheduled': 'Byateganijwe',
    'sent': 'Byoherejwe',
    'failed': 'Byanze',
    'status': 'Uko bimeze',
    'scheduledFor': 'Byateganijwe kuri',
    'sentOn': 'Byoherejwe ku wa',
    'noMessagesYet': 'Nta butumwa uracyafite. Kora ubwawe bwa mbere!',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'rw'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'rw';
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'rw' : 'en';
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const setLanguage = (lang: 'en' | 'rw') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
