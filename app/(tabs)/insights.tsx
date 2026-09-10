import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useSubscriptionStore } from "@/lib/subscriptionStore";

const Insights = () => {
    const router = useRouter();

    const { subscriptions } = useSubscriptionStore();

    // Currently selected graph bar
    const [selectedDay, setSelectedDay] = useState("Thr");

    /*
     * Graph data
     *
     * These values match the Figma design.
     * The graph is interactive - tapping a bar changes
     * the selected day and amount bubble.
     */
    const weeklyData = [
        {
            day: "Mon",
            value: 32,
            amount: 32,
        },
        {
            day: "Tue",
            value: 27,
            amount: 27,
        },
        {
            day: "Wed",
            value: 19,
            amount: 19,
        },
        {
            day: "Thr",
            value: 38,
            amount: 40,
        },
        {
            day: "Fri",
            value: 31,
            amount: 31,
        },
        {
            day: "Sat",
            value: 17,
            amount: 17,
        },
        {
            day: "Sun",
            value: 21,
            amount: 21,
        },
    ];

    // Find currently selected bar
    const selectedBar =
        weeklyData.find(
            (item) => item.day === selectedDay
        ) || weeklyData[3];

    // Calculate total monthly expenses from subscriptions
    const totalExpenses = subscriptions.reduce(
        (total, subscription) => {
            return (
                total +
                (Number(subscription.price) || 0)
            );
        },
        0
    );

    const formatPrice = (
        price: number | string | undefined
    ) => {
        const value = Number(price) || 0;

        return `$${value.toFixed(2)}`;
    };

    // Open a particular subscription
    const openSubscription = (id: string) => {
        router.push({
            pathname: "/(tabs)/subscriptions",
            params: {
                subscriptionId: id,
            },
        });
    };

    const historySubscriptions =
        subscriptions.slice(0, 4);

    return (
        <SafeAreaView
            style={styles.safeArea}
            edges={["top"]}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.contentContainer
                }
                showsVerticalScrollIndicator={false}
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View style={styles.header}>

                    <Pressable
                        style={styles.roundButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color="#07152D"
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Monthly Insights
                    </Text>

                    <Pressable
                        style={styles.roundButton}
                    >
                        <Ionicons
                            name="ellipsis-horizontal"
                            size={20}
                            color="#07152D"
                        />
                    </Pressable>

                </View>

                {/* ================================================= */}
                {/* UPCOMING */}
                {/* ================================================= */}

                <View style={styles.sectionHeader}>

                    <Text style={styles.sectionTitle}>
                        Upcoming
                    </Text>

                    <Pressable
                        style={styles.viewAllButton}
                        onPress={() =>
                            router.push(
                                "/(tabs)/subscriptions"
                            )
                        }
                    >
                        <Text style={styles.viewAllText}>
                            View all
                        </Text>
                    </Pressable>

                </View>

                {/* ================================================= */}
                {/* INTERACTIVE GRAPH */}
                {/* ================================================= */}

                <View style={styles.chartCard}>

                    {/* Y AXIS */}

                    <View style={styles.yAxis}>

                        <Text style={styles.axisText}>
                            45
                        </Text>

                        <Text style={styles.axisText}>
                            35
                        </Text>

                        <Text style={styles.axisText}>
                            25
                        </Text>

                        <Text style={styles.axisText}>
                            15
                        </Text>

                        <Text style={styles.axisText}>
                            5
                        </Text>

                        <Text style={styles.axisText}>
                            0
                        </Text>

                    </View>

                    {/* CHART AREA */}

                    <View style={styles.chartArea}>

                        {/* GRID */}

                        <View
                            style={[
                                styles.gridLine,
                                { top: 26 },
                            ]}
                        />

                        <View
                            style={[
                                styles.gridLine,
                                { top: 56 },
                            ]}
                        />

                        <View
                            style={[
                                styles.gridLine,
                                { top: 86 },
                            ]}
                        />

                        <View
                            style={[
                                styles.gridLine,
                                { top: 116 },
                            ]}
                        />

                        {/* BARS */}

                        <View style={styles.barsContainer}>

                            {weeklyData.map(
                                (bar) => {

                                    const isSelected =
                                        selectedDay ===
                                        bar.day;

                                    return (
                                        <Pressable
                                            key={bar.day}
                                            style={
                                                styles.barColumn
                                            }
                                            onPress={() =>
                                                setSelectedDay(
                                                    bar.day
                                                )
                                            }
                                            android_ripple={{
                                                color:
                                                    "transparent",
                                            }}
                                        >

                                            {/* SELECTED VALUE */}

                                            {isSelected && (
                                                <View
                                                    style={
                                                        styles.amountBubble
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.amountText
                                                        }
                                                    >
                                                        $
                                                        {
                                                            bar.amount
                                                        }
                                                    </Text>
                                                </View>
                                            )}

                                            {/* BAR */}

                                            <View
                                                style={[
                                                    styles.bar,
                                                    {
                                                        height:
                                                            bar.value *
                                                            3,
                                                        backgroundColor:
                                                            isSelected
                                                                ? "#F27A50"
                                                                : "#07152D",
                                                    },
                                                ]}
                                            />

                                            {/* DAY */}

                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    isSelected &&
                                                    styles.activeDayText,
                                                ]}
                                            >
                                                {bar.day}
                                            </Text>

                                        </Pressable>
                                    );
                                }
                            )}

                        </View>

                    </View>

                </View>

                {/* ================================================= */}
                {/* SELECTED GRAPH INFORMATION */}
                {/* ================================================= */}

                <View style={styles.selectedInfo}>

                    <Text style={styles.selectedDay}>
                        {selectedBar.day}
                    </Text>

                    <Text style={styles.selectedAmount}>
                        ${selectedBar.amount}
                    </Text>

                    <Text style={styles.selectedLabel}>
                        upcoming subscription
                    </Text>

                </View>

                {/* ================================================= */}
                {/* EXPENSES */}
                {/* ================================================= */}

                <Pressable
                    style={styles.expenseCard}
                    onPress={() =>
                        router.push(
                            "/(tabs)/subscriptions"
                        )
                    }
                >

                    <View>

                        <Text style={styles.expenseTitle}>
                            Expenses
                        </Text>

                        <Text style={styles.expenseMonth}>
                            March 2026
                        </Text>

                    </View>

                    <View
                        style={styles.expenseRight}
                    >

                        <Text
                            style={
                                styles.expenseAmount
                            }
                        >
                            -
                            {formatPrice(
                                totalExpenses
                            )}
                        </Text>

                        <Text
                            style={
                                styles.expensePercentage
                            }
                        >
                            +12%
                        </Text>

                    </View>

                </Pressable>

                {/* ================================================= */}
                {/* HISTORY */}
                {/* ================================================= */}

                <View
                    style={styles.historyHeader}
                >

                    <Text style={styles.sectionTitle}>
                        History
                    </Text>

                    <Pressable
                        style={styles.viewAllButton}
                        onPress={() =>
                            router.push(
                                "/(tabs)/subscriptions"
                            )
                        }
                    >
                        <Text style={styles.viewAllText}>
                            View all
                        </Text>
                    </Pressable>

                </View>

                {/* ================================================= */}
                {/* REAL SUBSCRIPTIONS */}
                {/* ================================================= */}

                {historySubscriptions.length ===
                0 ? (

                    <View
                        style={styles.emptyCard}
                    >

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No subscriptions yet
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Add a subscription to
                            see it here.
                        </Text>

                    </View>

                ) : (

                    historySubscriptions.map(
                        (
                            subscription,
                            index
                        ) => {

                            const isClaude =
                                subscription.name
                                    ?.toLowerCase()
                                    .includes(
                                        "claude"
                                    );

                            const isCanva =
                                subscription.name
                                    ?.toLowerCase()
                                    .includes(
                                        "canva"
                                    );

                            return (
                                <Pressable
                                    key={
                                        subscription.id
                                    }
                                    onPress={() =>
                                        openSubscription(
                                            subscription.id
                                        )
                                    }
                                    style={[
                                        styles.subscriptionCard,

                                        isClaude
                                            ? styles.claudeCard
                                            : isCanva
                                                ? styles.canvaCard
                                                : styles.defaultCard,

                                        index ===
                                        historySubscriptions.length -
                                        1 &&
                                        styles.lastCard,
                                    ]}
                                >

                                    {/* ICON */}

                                    <View
                                        style={
                                            styles.serviceIconBox
                                        }
                                    >

                                        {isClaude ? (

                                            <View
                                                style={
                                                    styles.claudeIcon
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.claudeSymbol
                                                    }
                                                >
                                                    ✳
                                                </Text>
                                            </View>

                                        ) : isCanva ? (

                                            <View
                                                style={
                                                    styles.canvaIcon
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.canvaText
                                                    }
                                                >
                                                    Canva
                                                </Text>
                                            </View>

                                        ) : (

                                            <View
                                                style={
                                                    styles.genericIcon
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.genericIconText
                                                    }
                                                >
                                                    {subscription.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </Text>
                                            </View>

                                        )}

                                    </View>

                                    {/* NAME */}

                                    <View
                                        style={
                                            styles.serviceInfo
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.serviceName,

                                                !isClaude &&
                                                !isCanva &&
                                                styles.darkText,
                                            ]}
                                        >
                                            {
                                                subscription.name
                                            }
                                        </Text>

                                        <Text
                                            style={[
                                                styles.serviceDate,

                                                !isClaude &&
                                                !isCanva &&
                                                styles.mutedText,
                                            ]}
                                        >
                                            {subscription.category ||
                                                "Subscription"}
                                        </Text>

                                    </View>

                                    {/* PRICE */}

                                    <View
                                        style={
                                            styles.servicePriceBox
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.servicePrice,

                                                !isClaude &&
                                                !isCanva &&
                                                styles.darkText,
                                            ]}
                                        >
                                            {formatPrice(
                                                subscription.price
                                            )}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.pricePeriod,

                                                !isClaude &&
                                                !isCanva &&
                                                styles.mutedText,
                                            ]}
                                        >
                                            per month
                                        </Text>

                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={15}
                                        color={
                                            isClaude ||
                                            isCanva
                                                ? "#5B4D27"
                                                : "#6D716F"
                                        }
                                    />

                                </Pressable>
                            );
                        }
                    )

                )}

                <View
                    style={{ height: 100 }}
                />

            </ScrollView>
        </SafeAreaView>
    );
};

export default Insights;


/* ========================================================= */
/*                         STYLES                             */
/* ========================================================= */

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#FFF9E8",
    },

    container: {
        flex: 1,
        backgroundColor: "#FFF9E8",
    },

    contentContainer: {
        paddingHorizontal: 12,
        paddingTop: 4,
    },

    /* HEADER */

    header: {
        height: 65,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#07152D",
    },

    roundButton: {
        width: 36,
        height: 36,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#DDD7C5",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF9E8",
    },

    /* SECTION */

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#07152D",
    },

    viewAllButton: {
        height: 27,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#D8D1BC",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF9E8",
    },

    viewAllText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#07152D",
    },

    /* GRAPH */

    chartCard: {
        height: 180,
        borderRadius: 12,
        backgroundColor: "#F5EBC9",
        flexDirection: "row",
        paddingTop: 12,
        paddingBottom: 8,
        paddingRight: 10,
        overflow: "hidden",
    },

    yAxis: {
        width: 30,
        height: 135,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 4,
    },

    axisText: {
        fontSize: 8,
        color: "#53617A",
    },

    chartArea: {
        flex: 1,
        height: 155,
        position: "relative",
    },

    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        borderTopWidth: 1,
        borderColor: "#E4D9B7",
        borderStyle: "dashed",
    },

    barsContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-start",
    },

    barColumn: {
        width: 35,
        height: 150,
        alignItems: "center",
        justifyContent: "flex-end",
        position: "relative",
    },

    bar: {
        width: 8,
        borderRadius: 8,
        marginBottom: 10,
    },

    dayText: {
        fontSize: 8,
        color: "#07152D",
        position: "absolute",
        bottom: 0,
    },

    activeDayText: {
        color: "#F27A50",
        fontWeight: "700",
    },

    amountBubble: {
        position: "absolute",
        top: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        zIndex: 10,

        // Small shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },

    amountText: {
        color: "#F27A50",
        fontSize: 9,
        fontWeight: "700",
    },

    /* SELECTED INFO */

    selectedInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 7,
        paddingHorizontal: 4,
    },

    selectedDay: {
        fontSize: 11,
        fontWeight: "700",
        color: "#07152D",
        marginRight: 7,
    },

    selectedAmount: {
        fontSize: 11,
        fontWeight: "700",
        color: "#F27A50",
        marginRight: 5,
    },

    selectedLabel: {
        fontSize: 9,
        color: "#77746A",
    },

    /* EXPENSES */

    expenseCard: {
        height: 59,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#DDD5BD",
        marginTop: 8,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF9E8",
    },

    expenseTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#07152D",
        marginBottom: 4,
    },

    expenseMonth: {
        fontSize: 10,
        color: "#6C6E75",
    },

    expenseRight: {
        alignItems: "flex-end",
    },

    expenseAmount: {
        fontSize: 13,
        fontWeight: "700",
        color: "#07152D",
        marginBottom: 4,
    },

    expensePercentage: {
        fontSize: 9,
        color: "#77746A",
    },

    /* HISTORY */

    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 11,
    },

    subscriptionCard: {
        minHeight: 65,
        borderRadius: 13,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 10,
    },

    claudeCard: {
        backgroundColor: "#FFD84D",
    },

    canvaCard: {
        backgroundColor: "#A7DCCE",
    },

    defaultCard: {
        backgroundColor: "#EEE9D9",
    },

    lastCard: {
        marginBottom: 0,
    },

    /* ICONS */

    serviceIconBox: {
        width: 38,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },

    claudeIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#FFE36B",
        alignItems: "center",
        justifyContent: "center",
    },

    claudeSymbol: {
        color: "#07152D",
        fontSize: 27,
    },

    canvaIcon: {
        width: 28,
        height: 28,
        borderRadius: 20,
        backgroundColor: "#454A51",
        alignItems: "center",
        justifyContent: "center",
    },

    canvaText: {
        color: "#FFFFFF",
        fontSize: 7,
        fontWeight: "600",
        fontStyle: "italic",
    },

    genericIcon: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "#D9D2BC",
        alignItems: "center",
        justifyContent: "center",
    },

    genericIconText: {
        color: "#07152D",
        fontSize: 15,
        fontWeight: "700",
    },

    /* SERVICE INFO */

    serviceInfo: {
        flex: 1,
        justifyContent: "center",
    },

    serviceName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#07152D",
        marginBottom: 5,
    },

    serviceDate: {
        fontSize: 9,
        color: "#5B4D27",
    },

    servicePriceBox: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: 7,
    },

    servicePrice: {
        fontSize: 13,
        fontWeight: "700",
        color: "#07152D",
        marginBottom: 5,
    },

    pricePeriod: {
        fontSize: 9,
        color: "#5B4D27",
    },

    darkText: {
        color: "#37404A",
    },

    mutedText: {
        color: "#75827D",
    },

    /* EMPTY */

    emptyCard: {
        backgroundColor: "#EEE9D9",
        borderRadius: 13,
        padding: 20,
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#07152D",
    },

    emptyText: {
        fontSize: 11,
        color: "#77746A",
        marginTop: 5,
    },
});