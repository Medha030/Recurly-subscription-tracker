import { useAuth, useSignIn } from '@clerk/expo';
import { Link, router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error !== null && 'errors' in error) {
        const errors = (
            error as {
                errors?: {
                    longMessage?: string;
                    message?: string;
                }[];
            }
        ).errors;

        return errors?.[0]?.longMessage ?? errors?.[0]?.message ?? fallback;
    }

    return fallback;
}

const SignIn = () => {
    const { signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const posthog = usePostHog();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If the user is already signed in, go directly to Home
    useEffect(() => {
        if (isSignedIn) {
            router.replace('/(tabs)');
        }
    }, [isSignedIn]);

    const handleSignIn = async () => {
        const nextErrors: {
            email?: string;
            password?: string;
        } = {};

        const normalizedEmail = email.trim().toLowerCase();

        // Validate email
        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            nextErrors.email = 'Enter a valid email address.';
        }

        // Validate password
        if (!password) {
            nextErrors.password = 'Enter your password.';
        }

        if (Object.keys(nextErrors).length) {
            setFieldErrors(nextErrors);
            return;
        }

        if (!signIn) return;

        setFieldErrors({});
        setFormError('');
        setIsSubmitting(true);

        try {
            const { error } = await signIn.password({
                identifier: normalizedEmail,
                password,
            });

            // Clerk returned an error
            if (error) {
                setFormError(
                    errorMessage(
                        error,
                        'We could not sign you in. Please try again.'
                    )
                );
                return;
            }

            // Successfully signed in
            if (signIn.createdSessionId) {
                await setActive({
                    session: signIn.createdSessionId,
                });

                posthog?.capture('user_signed_in');

                // Go to Home
                router.replace('/(tabs)');
            }
        } catch (error) {
            setFormError(
                errorMessage(
                    error,
                    'We could not sign you in. Please check your connection and try again.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                className="auth-screen"
                behavior={Platform.select({
                    ios: 'padding',
                    default: undefined,
                })}
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Brand */}
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">R</Text>
                            </View>

                            <View>
                                <Text className="auth-wordmark">Recurly</Text>
                                <Text className="auth-wordmark-sub">
                                    Smart billing
                                </Text>
                            </View>
                        </View>

                        <Text className="auth-title">
                            Welcome back
                        </Text>

                        <Text className="auth-subtitle">
                            Sign in to keep your subscriptions organized.
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="auth-card">
                        <View className="auth-form">

                            {/* Email */}
                            <View className="auth-field">
                                <Text className="auth-label">
                                    Email
                                </Text>

                                <TextInput
                                    className={`auth-input ${
                                        fieldErrors.email
                                            ? 'auth-input-error'
                                            : ''
                                    }`}
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);

                                        setFieldErrors((current) => ({
                                            ...current,
                                            email: undefined,
                                        }));
                                    }}
                                    placeholder="you@example.com"
                                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    autoComplete="email"
                                    returnKeyType="next"
                                />

                                {fieldErrors.email ? (
                                    <Text className="auth-error">
                                        {fieldErrors.email}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Password */}
                            <View className="auth-field">
                                <Text className="auth-label">
                                    Password
                                </Text>

                                <TextInput
                                    className={`auth-input ${
                                        fieldErrors.password
                                            ? 'auth-input-error'
                                            : ''
                                    }`}
                                    value={password}
                                    onChangeText={(value) => {
                                        setPassword(value);

                                        setFieldErrors((current) => ({
                                            ...current,
                                            password: undefined,
                                        }));
                                    }}
                                    placeholder="Enter your password"
                                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                    secureTextEntry
                                    textContentType="password"
                                    autoComplete="current-password"
                                    returnKeyType="go"
                                    onSubmitEditing={handleSignIn}
                                />

                                {fieldErrors.password ? (
                                    <Text className="auth-error">
                                        {fieldErrors.password}
                                    </Text>
                                ) : null}
                            </View>

                            {/* General error */}
                            {formError ? (
                                <Text
                                    accessibilityRole="alert"
                                    className="auth-error"
                                >
                                    {formError}
                                </Text>
                            ) : null}

                            {/* Sign In button */}
                            <Pressable
                                className={`auth-button ${
                                    isSubmitting
                                        ? 'auth-button-disabled'
                                        : ''
                                }`}
                                onPress={handleSignIn}
                                disabled={isSubmitting}
                                accessibilityRole="button"
                                accessibilityLabel="Sign in"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#081126" />
                                ) : (
                                    <Text className="auth-button-text">
                                        Sign in
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        {/* Sign Up */}
                        <View className="auth-link-row">
                            <Text className="auth-link-copy">
                                New to Recurly?
                            </Text>

                            <Link
                                href="/(auth)/sign-up"
                                replace
                                asChild
                            >
                                <Pressable accessibilityRole="link">
                                    <Text className="auth-link">
                                        Create an account
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;