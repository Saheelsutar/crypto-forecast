import { store } from '../store/store';
import { setCryptoData, addNotification } from '../store/slices/cryptoSlice';
import { setNewsItems } from '../store/slices/newsSlice';

export const loadMockData = () => {
  // Mock crypto data
  const cryptoData = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 49235.89,
      priceChange24h: 2.5,
      marketCap: 927846283901,
      volume24h: 35792145670,
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2738.55,
      priceChange24h: -0.8,
      marketCap: 328945672134,
      volume24h: 18763491287,
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      price: 1.21,
      priceChange24h: 5.6,
      marketCap: 38761293845,
      volume24h: 2871564320,
    },
  ];

  // Mock news data
  const newsData = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
      description: 'Bitcoin surpassed its previous record as more institutional investors acquire the cryptocurrency.',
      url: 'https://example.com/bitcoin-ath',
      source: 'Crypto News',
      publishedAt: '2023-04-01T10:30:00Z',
      imageUrl: 'https://example.com/images/bitcoin.jpg',
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Upgrade On Track for Summer Release',
      description: 'Developers confirm that the much-anticipated Ethereum upgrade is proceeding according to schedule.',
      url: 'https://example.com/ethereum-upgrade',
      source: 'Blockchain Daily',
      publishedAt: '2023-03-28T14:15:00Z',
      imageUrl: 'https://example.com/images/ethereum.jpg',
    },
    {
      id: '3',
      title: 'Central Banks Exploring Digital Currencies',
      description: 'Several major central banks announce pilots for central bank digital currencies (CBDCs).',
      url: 'https://example.com/cbdc-pilots',
      source: 'Financial Times',
      publishedAt: '2023-03-25T08:45:00Z',
      imageUrl: 'https://example.com/images/cbdc.jpg',
    },
    {
      id: '4',
      title: 'NFT Market Shows Signs of Recovery After Winter Slump',
      description: 'Non-fungible token sales are increasing again after months of declining activity.',
      url: 'https://example.com/nft-recovery',
      source: 'Digital Art Review',
      publishedAt: '2023-03-22T16:20:00Z',
      imageUrl: 'https://example.com/images/nft.jpg',
    },
    {
      id: '5',
      title: 'New Regulations for Crypto Exchanges Being Considered',
      description: 'Lawmakers propose new regulatory framework for cryptocurrency exchanges.',
      url: 'https://example.com/crypto-regulations',
      source: 'Regulatory Watch',
      publishedAt: '2023-03-20T11:10:00Z',
      imageUrl: 'https://example.com/images/regulations.jpg',
    },
  ];

  // Sample notifications
  const notifications = [
    {
      id: `mock-${Date.now()}-1`,
      type: 'price_alert' as const,
      cryptoId: 'bitcoin',
      message: 'Bitcoin (BTC) has increased by 5.2% in the last hour',
      timestamp: Date.now() - 3600000,
      read: false
    },
    {
      id: `mock-${Date.now()}-2`,
      type: 'price_alert' as const,
      cryptoId: 'ethereum',
      message: 'Ethereum (ETH) has decreased by 3.1% in the last hour',
      timestamp: Date.now() - 7200000,
      read: false
    }
  ];

  // Dispatch actions to store the mock data
  // No need to set weather data as we're using the real API
  store.dispatch(setCryptoData(cryptoData));
  store.dispatch(setNewsItems(newsData));
  
  // Add sample notifications
  notifications.forEach(notification => {
    store.dispatch(addNotification(notification));
  });
}; 