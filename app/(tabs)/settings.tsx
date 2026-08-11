import {View, Text, SafeAreaView} from 'react-native'
import React from 'react'
import {styled} from "react-native-css";
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';
const SafeArea = styled (RNSafeAreaView);



const Settings=() => {
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text>Settings</Text>
        </SafeAreaView>
    )
}
export default Settings;