export const PLATFORM_NAME = "Alpino Protein Café";

export const PLANS = [
  {
    id: 'trial_food',
    name: 'TRIAL PLAN: Food Only',
    type: 'trial',
    price: 1299,
    duration: 5,
    description: '5-Day Starter with fixed menu',
    includes: ['Food']
  },
  {
    id: 'trial_shakes',
    name: 'TRIAL PLAN: Food + Shakes',
    type: 'trial',
    price: 1949,
    duration: 5,
    description: '5-Day Starter with fixed menu + shakes',
    includes: ['Food', 'Shakes']
  },
  {
    id: 'trial_smoothies',
    name: 'TRIAL PLAN: Food + Smoothies',
    type: 'trial',
    price: 2249,
    duration: 5,
    description: '5-Day Starter with fixed menu + smoothies',
    includes: ['Food', 'Smoothies']
  },
  {
    id: 'pro_food',
    name: 'PRO PLAN: Food Only',
    type: 'pro',
    price: 4499,
    duration: 20,
    description: '20-Day Routine with multiple choice bowls',
    includes: ['Food']
  },
  {
    id: 'pro_shakes',
    name: 'PRO PLAN: Food + Shakes',
    type: 'pro',
    price: 6699,
    duration: 20,
    description: '20-Day Routine + daily shakes',
    includes: ['Food', 'Shakes']
  },
  {
    id: 'pro_smoothies',
    name: 'PRO PLAN: Food + Smoothies',
    type: 'pro',
    price: 7799,
    duration: 20,
    description: '20-Day Routine + daily smoothies',
    includes: ['Food', 'Smoothies']
  }
];

export const MENU_ITEMS = [
  // Bowls
  { 
    id: 'b1', 
    name: 'Mexican Paneer Rice Bowl', 
    category: 'Bowl', 
    protein: 28, 
    calories: 517, 
    price: 319, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800',
    description: 'Spiced Paneer, Brown Rice, Corn, Rajma & Fresh Veggies with Chipotle Sauce.'
  },
  { 
    id: 'b2', 
    name: 'Muscle Mania Makhni Rice Bowl', 
    category: 'Bowl', 
    protein: 38, 
    calories: 650, 
    price: 349, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800',
    description: 'Creamy Makhni Gravy with Tandoori Paneer, Brown Rice & Pomegranate.'
  },
  { 
    id: 'b3', 
    name: 'Chole Power Rice Bowl', 
    category: 'Bowl', 
    protein: 18, 
    calories: 388, 
    price: 269, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    description: 'Turkish Chickpeas, Brown Rice, Fresh Veggies, Hummus & Shatta Sauce.'
  },
  { 
    id: 'b4', 
    name: 'Lean Mexi Cali Salad Bowl', 
    category: 'Bowl', 
    protein: 34, 
    calories: 650, 
    price: 309, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    description: 'Grilled Mexican Paneer with Lettuce, Corn, Rajma & Chipotle Dressing.'
  },
  { 
    id: 'b5', 
    name: 'Calorie Killer Chole Salad Bowl', 
    category: 'Bowl', 
    protein: 15, 
    calories: 329, 
    price: 289, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=800',
    description: 'Turkish Chickpeas with Fresh Veggies, Hummus & Pomegranate Seeds.'
  },
  { 
    id: 'b6', 
    name: 'Soba Noodle PB Bowl', 
    category: 'Bowl', 
    protein: 36, 
    calories: 531, 
    price: 319, 
    isTrialFixed: false,
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800',
    description: 'Soba Noodles in Creamy Peanut-Soy Sauce with Vegetables & Spiced Paneer.'
  },
  
  // Smoothies
  { 
    id: 'sm1', 
    name: 'Gym Special', 
    category: 'Smoothie', 
    protein: 30, 
    calories: 310, 
    price: 279, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80&w=800',
    description: 'Mixed Berries with Yogurt and Protein — Light and Fruity.'
  },
  { 
    id: 'sm2', 
    name: 'Strawberry Hit', 
    category: 'Smoothie', 
    protein: 20, 
    calories: 299, 
    price: 249, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1543644574-19750f5194b5?auto=format&fit=crop&q=80&w=800',
    description: 'Creamy Yogurt-based Strawberry Smoothie with Oats and Nuts.'
  },
  { 
    id: 'sm3', 
    name: 'Mango Surge', 
    category: 'Smoothie', 
    protein: 20, 
    calories: 299, 
    price: 249, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&q=80&w=800',
    description: 'Sweet Mango Blended with Yogurt and Protein for a Tropical Flavor.'
  },
  { 
    id: 'sm4', 
    name: 'Hydration Fuel Watermelon', 
    category: 'Smoothie', 
    protein: 20, 
    calories: 289, 
    price: 239, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1506802913710-40e2e66339c9?auto=format&fit=crop&q=80&w=800',
    description: 'Fresh Watermelon, Strawberries & Protein with a Light, Refreshing Taste.'
  },
  { 
    id: 'sm5', 
    name: 'Bulk Fuel (PB Banana Oats)', 
    category: 'Smoothie', 
    protein: 30, 
    calories: 289, 
    price: 239, 
    isTrialFixed: true,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d019cb0?auto=format&fit=crop&q=80&w=800',
    description: 'Banana, Peanut Butter, Oats & Protein — Rich and Filling.'
  },
  { 
    id: 'sm6', 
    name: 'Caffeine Warrior', 
    category: 'Smoothie', 
    protein: 20, 
    calories: 299, 
    price: 249, 
    isTrialFixed: true, 
    image: 'https://images.unsplash.com/photo-1572286258217-48887a05442b?auto=format&fit=crop&q=80&w=800',
    description: 'Coffee & Protein For A Smooth Energy Boost.' 
  },

  // Shakes
  { id: 'sh1', name: 'Chocolate Shake', category: 'Shake', protein: 30, calories: 310, price: 169, isTrialFixed: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', description: 'Premium chocolate protein blend for muscle recovery.' },
  { id: 'sh2', name: 'Mango Shake', category: 'Shake', protein: 30, calories: 310, price: 169, isTrialFixed: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800', description: 'Tropical mango twist with elite whey protein.' },
  { id: 'sh3', name: 'Coffee Shake', category: 'Shake', protein: 20, calories: 280, price: 169, isTrialFixed: true, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800', description: 'Energy boost with double shot espresso and protein.' },

  // Wraps
  { id: 'w1', name: "Athlete's Shawarma Wrap", category: 'Wrap', protein: 25, calories: 683, price: 239, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1662116765994-4e321adec670?auto=format&fit=crop&q=80&w=800', description: 'Tandoori Paneer, Shatta Sauce, Pickled Onions & Garlic Mayo in a Soft Wrap.' },
  { id: 'w2', name: 'Mexican Burrito Wrap', category: 'Wrap', protein: 23, calories: 635, price: 239, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800', description: 'Spiced Paneer, Brown Rice, Corn, Rajma & Chipotle Sauce in a Tortilla.' },

  // Subs
  { id: 's1', name: 'Power Mexican Sub', category: 'Sub', protein: 20, calories: 832, price: 269, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800', description: 'Spiced Paneer, Lettuce, Corn, Bell Peppers & Chipotle Mayo in a Toasted Sub.' },
  { id: 's2', name: 'Middle Eastern Fusion Sub', category: 'Sub', protein: 26, calories: 827, price: 269, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1554502078-ef0fc409efce?auto=format&fit=crop&q=80&w=800', description: 'Paneer, Hummus, Pickled Onions, Bell Peppers & Sriracha in a Sub Roll.' },

  // Oats
  { id: 'o1', name: 'Chocolatey Oats Date Bowl', category: 'Oats', protein: 18, calories: 325, price: 209, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=800', description: 'Creamy Chocolate Oats sweetened with Dates and Topped with Seeds.' },
  { id: 'o2', name: 'Turbo Charge Honey Oats Bowl', category: 'Oats', protein: 21, calories: 396, price: 209, isTrialFixed: false, image: 'https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?auto=format&fit=crop&q=80&w=800', description: 'Honey flavored Oats with Muesli, Nuts and Crunchy Seeds.' },
];
