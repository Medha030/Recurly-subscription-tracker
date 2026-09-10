import {
    Text,
    View,
    TextInput,
    FlatList,
} from "react-native";

import {
    SafeAreaView as RNSafeAreaView,
} from "react-native-safe-area-context";

import { styled } from "react-native-css";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Get subscriptionId when coming from Insights
    const { subscriptionId } = useLocalSearchParams<{
        subscriptionId?: string;
    }>();

    const { subscriptions } = useSubscriptionStore();

    // Automatically expand the subscription selected from Insights
    useEffect(() => {
        if (subscriptionId) {
            setExpandedId(subscriptionId);
        }
    }, [subscriptionId]);

    // Search subscriptions
    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.plan
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background">

            <FlatList
                data={filteredSubscriptions}

                keyExtractor={(item) => item.id}

                /* ================= HEADER ================= */

                ListHeaderComponent={
                    <View className="px-5 pt-5">

                        <Text className="text-3xl font-bold text-dark mb-5">
                            Subscriptions
                        </Text>

                        <TextInput
                            className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
                            placeholder="Search subscriptions..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                    </View>
                }

                /* ================= SUBSCRIPTION CARD ================= */

                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}

                        expanded={
                            expandedId === item.id
                        }

                        onPress={() => {
                            setExpandedId(
                                expandedId === item.id
                                    ? null
                                    : item.id
                            );
                        }}
                    />
                )}

                /* ================= LIST STYLE ================= */

                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                    gap: 12,
                }}

                showsVerticalScrollIndicator={false}

                keyboardShouldPersistTaps="handled"

                keyboardDismissMode="on-drag"
            />

        </SafeAreaView>
    );
};

export default Subscriptions;