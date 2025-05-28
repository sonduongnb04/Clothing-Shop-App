import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Không tìm thấy trang!' }} />
            <ThemedView style={styles.container}>
                <ThemedText type="title">Trang này không tồn tại.</ThemedText>
                <ThemedText style={styles.description}>
                    Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
                </ThemedText>
                <Link href="/" style={styles.link}>
                    <ThemedText type="link">Quay về trang chủ</ThemedText>
                </Link>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        opacity: 0.7,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
}); 