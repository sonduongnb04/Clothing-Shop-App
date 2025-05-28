import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/_layout';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { addAddress, updateAddress } from '@/src/services/userService';

// Định nghĩa kiểu dữ liệu
type AddressFormData = {
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    isDefault: boolean;
};

export default function AddressFormScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { mode, addressId, addressData } = useLocalSearchParams();

    const [formData, setFormData] = useState<AddressFormData>({
        fullName: '',
        phoneNumber: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<AddressFormData>>({});

    const isEditMode = mode === 'edit';

    // Load dữ liệu địa chỉ khi ở chế độ edit
    useEffect(() => {
        if (isEditMode && addressData) {
            try {
                const parsedData = JSON.parse(addressData as string);
                setFormData(parsedData);
            } catch (error) {
                console.error('Lỗi khi parse dữ liệu địa chỉ:', error);
                Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
                router.back();
            }
        }
    }, [isEditMode, addressData]);

    // Validation form
    const validateForm = (): boolean => {
        const newErrors: Partial<AddressFormData> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }

        if (!formData.province.trim()) {
            newErrors.province = 'Vui lòng nhập tỉnh/thành phố';
        }

        if (!formData.district.trim()) {
            newErrors.district = 'Vui lòng nhập quận/huyện';
        }

        if (!formData.ward.trim()) {
            newErrors.ward = 'Vui lòng nhập phường/xã';
        }

        if (!formData.streetAddress.trim()) {
            newErrors.streetAddress = 'Vui lòng nhập địa chỉ cụ thể';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý lưu địa chỉ
    const handleSaveAddress = async () => {
        if (!user) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập');
            return;
        }

        if (!validateForm()) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode && addressId) {
                await updateAddress(user._id, {
                    ...formData,
                    id: addressId as string,
                });
                Alert.alert('Thành công', 'Đã cập nhật địa chỉ');
            } else {
                await addAddress(user._id, formData);
                Alert.alert('Thành công', 'Đã thêm địa chỉ mới');
            }

            router.back();
        } catch (error) {
            console.error('Lỗi khi lưu địa chỉ:', error);
            Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật field trong form
    const updateField = (field: keyof AddressFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Xóa lỗi khi user bắt đầu nhập
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Render input field
    const renderInputField = (
        label: string,
        field: keyof AddressFormData,
        placeholder: string,
        keyboardType: 'default' | 'phone-pad' = 'default',
        multiline: boolean = false
    ) => (
        <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>
                {label} <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
                style={[
                    styles.textInput,
                    multiline && styles.multilineInput,
                    errors[field] && styles.errorInput
                ]}
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={formData[field] as string}
                onChangeText={(text) => updateField(field, text)}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
            />
            {errors[field] && (
                <ThemedText style={styles.errorText}>{errors[field]}</ThemedText>
            )}
        </ThemedView>
    );

    if (!user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>
                        {isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
                    </ThemedText>
                    <ThemedView style={styles.headerRight} />
                </ThemedView>

                <ThemedView style={styles.loginPromptContainer}>
                    <Ionicons name="person-outline" size={80} color="#ccc" />
                    <ThemedText style={styles.loginPromptTitle}>Vui lòng đăng nhập</ThemedText>
                    <ThemedText style={styles.loginPromptText}>
                        Đăng nhập để quản lý địa chỉ giao hàng
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/login')}
                    >
                        <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>
                    {isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
                </ThemedText>
                <ThemedView style={styles.headerRight} />
            </ThemedView>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Thông tin liên hệ */}
                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Thông tin liên hệ</ThemedText>

                    {renderInputField('Họ và tên', 'fullName', 'Nhập họ và tên đầy đủ')}
                    {renderInputField('Số điện thoại', 'phoneNumber', 'Nhập số điện thoại', 'phone-pad')}
                </ThemedView>

                {/* Địa chỉ */}
                <ThemedView style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Địa chỉ</ThemedText>

                    {renderInputField('Tỉnh/Thành phố', 'province', 'Nhập tỉnh/thành phố')}
                    {renderInputField('Quận/Huyện', 'district', 'Nhập quận/huyện')}
                    {renderInputField('Phường/Xã', 'ward', 'Nhập phường/xã')}
                    {renderInputField('Địa chỉ cụ thể', 'streetAddress', 'Số nhà, tên đường...', 'default', true)}
                </ThemedView>

                {/* Cài đặt */}
                <ThemedView style={styles.section}>
                    <ThemedView style={styles.switchContainer}>
                        <ThemedView style={styles.switchLabelContainer}>
                            <ThemedText style={styles.switchLabel}>Đặt làm địa chỉ mặc định</ThemedText>
                            <ThemedText style={styles.switchDescription}>
                                Địa chỉ này sẽ được chọn tự động khi đặt hàng
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={formData.isDefault}
                            onValueChange={(value) => updateField('isDefault', value)}
                            trackColor={{ false: '#e9ecef', true: '#FF4500' }}
                            thumbColor={formData.isDefault ? '#fff' : '#f4f3f4'}
                        />
                    </ThemedView>
                </ThemedView>

                {/* Ghi chú */}
                <ThemedView style={styles.noteSection}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <ThemedText style={styles.noteText}>
                        Thông tin địa chỉ sẽ được sử dụng để giao hàng. Vui lòng đảm bảo thông tin chính xác.
                    </ThemedText>
                </ThemedView>
            </ScrollView>

            {/* Footer */}
            <ThemedView style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSaveAddress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <ThemedText style={styles.saveButtonText}>
                            {isEditMode ? 'Cập nhật' : 'Lưu địa chỉ'}
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 32,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#dc3545',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    errorInput: {
        borderColor: '#dc3545',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 4,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabelContainer: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    noteSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#FF4500',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
    loginPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loginPromptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    loginPromptText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    loginButton: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 