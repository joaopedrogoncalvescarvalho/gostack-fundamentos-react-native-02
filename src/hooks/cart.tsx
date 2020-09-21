import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const keyStorageStoreCart = '@GoStore:cart';

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem(keyStorageStoreCart);

      setProducts(JSON.parse(cart || '[]'));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      /* const cartUpdate = products.map(oldProduct => {
        if (oldProduct.id !== product.id) {
          return oldProduct;
        }

        return {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: product.quantity + 1,
        };
      }); */

      const cartUpdate = products.concat([
        {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        },
      ]);

      await AsyncStorage.setItem(
        keyStorageStoreCart,
        JSON.stringify(cartUpdate),
      );

      setProducts(cartUpdate);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cartUpdate = products.map(product => {
        if (product.id !== id) {
          return product;
        }

        return {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: product.quantity + 1,
        };
      });

      await AsyncStorage.setItem(
        keyStorageStoreCart,
        JSON.stringify(cartUpdate),
      );

      setProducts(cartUpdate);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cartUpdate = products.map(product => {
        if (product.id !== id) {
          return product;
        }

        return {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: product.quantity - 1,
        };
      });

      await AsyncStorage.setItem(
        keyStorageStoreCart,
        JSON.stringify(cartUpdate),
      );

      setProducts(cartUpdate);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
