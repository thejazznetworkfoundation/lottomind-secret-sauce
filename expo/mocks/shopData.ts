export interface EBook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  originalPrice?: string;
  coverImage: string;
  downloadUrl: string;
  pages: number;
  tag?: string;
}

export interface TShirt {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  sizes: string[];
  colors: string[];
  purchaseUrl: string;
  tag?: string;
}

export const EBOOKS: EBook[] = [
  {
    id: 'ebook-1',
    title: 'The Lotto Mind Playbook',
    subtitle: 'Master the Numbers Game',
    description: 'A comprehensive guide to understanding lottery patterns, frequency analysis, and smart number selection strategies used by seasoned players.',
    price: '$9.99',
    originalPrice: '$14.99',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    downloadUrl: 'https://example.com/ebooks/lotto-mind-playbook.pdf',
    pages: 142,
    tag: 'BESTSELLER',
  },
  {
    id: 'ebook-2',
    title: 'Dream Numbers Decoded',
    subtitle: 'Turn Dreams Into Digits',
    description: 'Learn the ancient art of dream numerology. This guide maps 200+ dream symbols to powerful number combinations backed by statistical analysis.',
    price: '$7.99',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    downloadUrl: 'https://example.com/ebooks/dream-numbers-decoded.pdf',
    pages: 98,
  },
  {
    id: 'ebook-3',
    title: 'Hot & Cold Strategy Bible',
    subtitle: 'Data-Driven Picks',
    description: 'Deep dive into hot/cold number theory with real historical data. Includes worksheets, tracking templates, and probability charts.',
    price: '$12.99',
    originalPrice: '$19.99',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    downloadUrl: 'https://example.com/ebooks/hot-cold-strategy.pdf',
    pages: 210,
    tag: 'NEW',
  },
  {
    id: 'ebook-4',
    title: 'Jackpot Mindset',
    subtitle: 'Psychology of Winners',
    description: 'Explore the mental framework and rituals of consistent lottery winners. Visualization techniques, affirmation scripts, and manifestation methods.',
    price: '$6.99',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    downloadUrl: 'https://example.com/ebooks/jackpot-mindset.pdf',
    pages: 76,
  },
];

export const TSHIRTS: TShirt[] = [
  {
    id: 'tshirt-1',
    name: 'I ❤ Detroit Navy Cap',
    description: 'Classic navy fitted cap with iconic I ❤ Detroit embroidered logo featuring the 1701 skyline design. Premium quality, adjustable back.',
    price: '$34.99',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/dz4ahma2wpeblismjr6pv.webp',
    sizes: ['One Size'],
    colors: ['Navy'],
    purchaseUrl: 'https://example.com/merch/detroit-navy-cap',
    tag: 'POPULAR',
  },
  {
    id: 'tshirt-2',
    name: 'I ❤ Detroit Embroidered Hoodie',
    description: 'Premium charcoal pullover hoodie with detailed I ❤ Detroit embroidered skyline design. Heavy fleece, kangaroo pocket.',
    price: '$59.99',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/t3ja84wfwwflihfgucdj3.webp',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Charcoal'],
    purchaseUrl: 'https://example.com/merch/detroit-charcoal-hoodie',
    tag: 'NEW',
  },
  {
    id: 'tshirt-3',
    name: 'I ❤ Detroit Collection Bundle',
    description: 'Complete I ❤ Detroit set — navy polo, embroidered cap, graphic tee & premium hoodie. The ultimate Detroit rep pack.',
    price: '$129.99',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0oigiyji5vjnmkkjn6nf9.webp',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Navy', 'Charcoal', 'Gray'],
    purchaseUrl: 'https://example.com/merch/detroit-collection-bundle',
    tag: 'POPULAR',
  },
  {
    id: 'tshirt-4',
    name: 'I ❤ Detroit Navy Hoodie',
    description: 'Premium navy pullover hoodie with vibrant I ❤ Detroit screenprint. Iconic skyline logo with sun design. Heavyweight fleece.',
    price: '$54.99',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/63gbf8nwzz4kwg7ekeztj.webp',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Navy'],
    purchaseUrl: 'https://example.com/merch/detroit-navy-hoodie',
  },
  {
    id: 'tshirt-5',
    name: 'Boogeyman BOO!! Collection',
    description: 'Bold red & green Boogeyman BOO!! design on premium black. Available as hoodie, tee & cap. Limited edition streetwear drop.',
    price: '$44.99',
    image: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pibzzas9jsg7nj9jqebnd.webp',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Black'],
    purchaseUrl: 'https://example.com/merch/boogeyman-boo-collection',
    tag: 'NEW',
  },
];
