import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { icons } from "@/constants/icons";

const CATEGORIES = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
    Entertainment: "#f5c542",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#b8e8d0",
    Productivity: "#c8e6c9",
    Cloud: "#b3e5fc",
    Music: "#f8bbd0",
    Other: "#d7ccc8",
};

type Frequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
        "Entertainment"
    );
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        price?: string;
    }>({});
    const isFormValid =
        name.trim().length > 0 &&
        Number.isFinite(Number(price.replace(",", "."))) &&
        Number(price.replace(",", ".")) > 0;

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        const parsedPrice = Number(price.replace(",", "."));
        const nextErrors: { name?: string; price?: string } = {};

        if (!name.trim()) {
            nextErrors.name = "Enter a subscription name.";
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            nextErrors.price = "Enter a price greater than zero.";
        }

        if (Object.keys(nextErrors).length) {
            setFieldErrors(nextErrors);
            return;
        }

        const startDate = dayjs();
        const subscription: Subscription = {
            id: `subscription-${Date.now()}`,
            name: name.trim(),
            price: parsedPrice,
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: startDate
                .add(1, frequency === "Monthly" ? "month" : "year")
                .toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: CATEGORY_COLORS[category],
            currency: "USD",
        };

        onCreate(subscription);
        resetForm();
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                className="modal-overlay"
                behavior={Platform.select({ ios: "padding", default: undefined })}
            >
                <View className="modal-container">
                    <View className="modal-header">
                        <Text className="modal-title">New Subscription</Text>
                        <Pressable
                            className="modal-close"
                            onPress={handleClose}
                            accessibilityRole="button"
                            accessibilityLabel="Close new subscription form"
                        >
                            <Text className="modal-close-text">×</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerClassName="modal-body"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="auth-field">
                            <Text className="auth-label">Name</Text>
                            <TextInput
                                className={clsx(
                                    "auth-input",
                                    fieldErrors.name && "auth-input-error"
                                )}
                                value={name}
                                onChangeText={(value) => {
                                    setName(value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        name: undefined,
                                    }));
                                }}
                                placeholder="e.g. Spotify Premium"
                                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                returnKeyType="next"
                            />
                            {fieldErrors.name ? (
                                <Text className="auth-error">{fieldErrors.name}</Text>
                            ) : null}
                        </View>

                        <View className="auth-field">
                            <Text className="auth-label">Price</Text>
                            <TextInput
                                className={clsx(
                                    "auth-input",
                                    fieldErrors.price && "auth-input-error"
                                )}
                                value={price}
                                onChangeText={(value) => {
                                    setPrice(value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        price: undefined,
                                    }));
                                }}
                                placeholder="0.00"
                                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                            {fieldErrors.price ? (
                                <Text className="auth-error">{fieldErrors.price}</Text>
                            ) : null}
                        </View>

                        <View className="auth-field">
                            <Text className="auth-label">Frequency</Text>
                            <View className="picker-row">
                                {(["Monthly", "Yearly"] as const).map((option) => (
                                    <Pressable
                                        key={option}
                                        className={clsx(
                                            "picker-option",
                                            frequency === option && "picker-option-active"
                                        )}
                                        onPress={() => setFrequency(option)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: frequency === option }}
                                    >
                                        <Text
                                            className={clsx(
                                                "picker-option-text",
                                                frequency === option &&
                                                    "picker-option-text-active"
                                            )}
                                        >
                                            {option}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View className="auth-field">
                            <Text className="auth-label">Category</Text>
                            <View className="category-scroll">
                                {CATEGORIES.map((option) => (
                                    <Pressable
                                        key={option}
                                        className={clsx(
                                            "category-chip",
                                            category === option && "category-chip-active"
                                        )}
                                        onPress={() => setCategory(option)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: category === option }}
                                    >
                                        <Text
                                            className={clsx(
                                                "category-chip-text",
                                                category === option &&
                                                    "category-chip-text-active"
                                            )}
                                        >
                                            {option}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <Pressable
                            className={clsx(
                                "auth-button",
                                !isFormValid && "auth-button-disabled"
                            )}
                            onPress={handleSubmit}
                            disabled={!isFormValid}
                            accessibilityRole="button"
                            accessibilityLabel="Create subscription"
                        >
                            <Text className="auth-button-text">Create subscription</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateSubscriptionModal;
