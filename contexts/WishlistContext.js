import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getWishlistFromStorage,
    addToWishlist as addToWishlistService,
    removeFromWishlist as removeFromWishlistService,
    isInWishlist as isInWishlistService
} from '../services/wishlistService';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadWishlist = useCallback(async (userId = undefined) => {
        try {
            setLoading(true);
            const items = await getWishlistFromStorage(userId);
            setWishlistItems(items);
        } catch (error) {
            console.error('Lỗi khi tải wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToWishlist = useCallback(async (product, userId = undefined) => {
        try {
            const result = await addToWishlistService(product, userId);
            if (result) {
                await loadWishlist(userId);
                return { success: true, message: 'Đã thêm vào danh sách yêu thích!' };
            } else {
                return { success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' };
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào wishlist:', error);
            return { success: false, message: 'Có lỗi xảy ra khi thêm vào danh sách yêu thích' };
        }
    }, [loadWishlist]);

    const removeFromWishlist = useCallback(async (productId, userId = undefined) => {
        try {
            await removeFromWishlistService(productId, userId);
            await loadWishlist(userId);
            return { success: true, message: 'Đã xóa khỏi danh sách yêu thích!' };
        } catch (error) {
            console.error('Lỗi khi xóa khỏi wishlist:', error);
            return { success: false, message: 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích' };
        }
    }, [loadWishlist]);

    const isInWishlist = useCallback(async (productId, userId = undefined) => {
        try {
            return await isInWishlistService(productId, userId);
        } catch (error) {
            console.error('Lỗi khi kiểm tra wishlist:', error);
            return false;
        }
    }, []);

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loadWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}; 