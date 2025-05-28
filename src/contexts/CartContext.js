import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getCart,
    addToCart as addToCartService,
    removeFromCart as removeFromCartService,
    updateCartItemQuantity as updateQuantityService,
    clearCart as clearCartService,
    calculateCartTotal,
    getCartItemCount
} from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState({
        subtotal: 0,
        totalItems: 0,
        shippingFee: 0,
        tax: 0,
        total: 0
    });

    // Load giỏ hàng khi component mount
    useEffect(() => {
        loadCart();
    }, []);

    // Tính toán lại tổng tiền khi giỏ hàng thay đổi
    useEffect(() => {
        const newTotal = calculateCartTotal(cartItems);
        setCartTotal(newTotal);
    }, [cartItems]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const cart = await getCart();
            setCartItems(cart);
        } catch (error) {
            console.error('Lỗi khi tải giỏ hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, selectedSize = null, selectedColor = null, quantity = 1) => {
        try {
            console.log('CartContext: Đang thêm vào giỏ hàng:', { product: product.name, selectedSize, selectedColor, quantity });
            setLoading(true);
            const result = await addToCartService(product, selectedSize, selectedColor, quantity);

            console.log('CartContext: Kết quả từ service:', result);

            if (result.success) {
                setCartItems(result.cart);
                console.log('CartContext: Đã cập nhật cartItems:', result.cart);
                return { success: true, message: 'Đã thêm vào giỏ hàng!' };
            } else {
                return { success: false, message: result.error };
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            return { success: false, message: 'Có lỗi xảy ra khi thêm vào giỏ hàng' };
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);
            const result = await removeFromCartService(itemId);

            if (result.success) {
                setCartItems(result.cart);
                return { success: true, message: 'Đã xóa khỏi giỏ hàng!' };
            } else {
                return { success: false, message: result.error };
            }
        } catch (error) {
            console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
            return { success: false, message: 'Có lỗi xảy ra khi xóa khỏi giỏ hàng' };
        } finally {
            setLoading(false);
        }
    };

    const updateCartItemQuantity = async (itemId, newQuantity) => {
        try {
            setLoading(true);
            const result = await updateQuantityService(itemId, newQuantity);

            if (result.success) {
                setCartItems(result.cart);
                return { success: true };
            } else {
                return { success: false, message: result.error };
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            return { success: false, message: 'Có lỗi xảy ra khi cập nhật số lượng' };
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            const result = await clearCartService();

            if (result.success) {
                setCartItems([]);
                return { success: true, message: 'Đã xóa toàn bộ giỏ hàng!' };
            } else {
                return { success: false, message: result.error };
            }
        } catch (error) {
            console.error('Lỗi khi xóa giỏ hàng:', error);
            return { success: false, message: 'Có lỗi xảy ra khi xóa giỏ hàng' };
        } finally {
            setLoading(false);
        }
    };

    const getItemQuantityInCart = (productId, selectedSize = null, selectedColor = null) => {
        const itemId = `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`;
        const item = cartItems.find(item => item.itemId === itemId);
        return item ? item.quantity : 0;
    };

    const isProductInCart = (productId, selectedSize = null, selectedColor = null) => {
        const itemId = `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`;
        return cartItems.some(item => item.itemId === itemId);
    };

    const value = {
        cartItems,
        loading,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getItemQuantityInCart,
        isProductInCart,
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 