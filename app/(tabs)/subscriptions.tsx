import {View, Text, SafeAreaView} from 'react-native'
import React from 'react'
import {styled} from "react-native-css";
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';
const SafeArea = styled (RNSafeAreaView);


const Subscriptions=() => {
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text>Subscriptions</Text>
        </SafeAreaView>
    )
}
export default Subscriptions;