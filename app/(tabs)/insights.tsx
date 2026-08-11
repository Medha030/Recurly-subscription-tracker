import {View, Text, SafeAreaView} from 'react-native'
import React from 'react'
import {styled} from "react-native-css";
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';
const SafeArea = styled (RNSafeAreaView);

const Insights=() => {
    return (
        <SafeAreaView className="flex-2 bg-background p-5">
            <Text>Insights</Text>
        </SafeAreaView>
    )
}
export default Insights;