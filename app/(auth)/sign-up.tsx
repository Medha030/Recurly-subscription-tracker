import { useSignUp } from '@clerk/expo';
import { Link } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = { email?: string; password?: string; confirmPassword?: string; code?: string };

function errorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error !== null && 'errors' in error) {
        const errors = (error as { errors?: { longMessage?: string; message?: string }[] }).errors;
        return errors?.[0]?.longMessage ?? errors?.[0]?.message ?? fallback;
    }
    return fallback;
}

const SignUp=() => {
    const { signUp } = useSignUp();
    const posthog = usePostHog();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateAccount = async () => {
        const nextErrors: FieldErrors = {};
        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.';
        if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
        if (Object.keys(nextErrors).length) { setFieldErrors(nextErrors); return; }
        if (!signUp) return;

        setFieldErrors({}); setFormError(''); setIsSubmitting(true);
        try {
            const { error } = await signUp.password({ emailAddress: normalizedEmail, password });
            if (error) { setFormError(errorMessage(error, 'We could not create your account. Please try again.')); return; }
            const { error: sendError } = await signUp.verifications.sendEmailCode();
            if (sendError) { setFormError(errorMessage(sendError, 'We could not send your verification code.')); return; }
            setIsVerifying(true);
        } catch (error) {
            setFormError(errorMessage(error, 'We could not create your account. Please check your connection and try again.'));
        } finally { setIsSubmitting(false); }
    };

    const handleVerify = async () => {
        if (!/^\d{4,8}$/.test(code.trim())) { setFieldErrors({code: 'Enter the code from your email.'}); return; }
        if (!signUp) return;
        setFieldErrors({}); setFormError(''); setIsSubmitting(true);
        try {
            const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
            if (error) { setFormError(errorMessage(error, 'That code was not accepted. Please try again.')); return; }
            const { error: finalizeError } = await signUp.finalize();
            if (finalizeError) {
                setFormError(errorMessage(finalizeError, 'Your account is ready, but we could not finish signing you in.'));
                return;
            }
            posthog?.capture('account_created');
        } catch (error) {
            setFormError(errorMessage(error, 'We could not verify that code. Please try again.'));
        } finally { setIsSubmitting(false); }
    };

    const handleResendCode = async () => {
        if (!signUp || isSubmitting) return;
        setFormError(''); setIsSubmitting(true);
        try {
            const { error } = await signUp.verifications.sendEmailCode();
            if (error) {
                setFormError(errorMessage(error, 'We could not send another code just yet.'));
                return;
            }
            posthog?.capture('verification_code_resent');
        } catch (error) { setFormError(errorMessage(error, 'We could not send another code just yet.')); }
        finally { setIsSubmitting(false); }
    };

    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView className="auth-screen" behavior={Platform.select({ios: 'padding', default: undefined})}>
                <ScrollView className="auth-scroll" contentContainerClassName="auth-content" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap"><View className="auth-logo-mark"><Text className="auth-logo-mark-text">R</Text></View><View><Text className="auth-wordmark">Recurly</Text><Text className="auth-wordmark-sub">Smart billing</Text></View></View>
                        <Text className="auth-title">{isVerifying ? 'Check your inbox' : 'Start with clarity'}</Text>
                        <Text className="auth-subtitle">{isVerifying ? `We sent a verification code to ${email.trim().toLowerCase()}.` : 'Create your account and bring every recurring cost into focus.'}</Text>
                    </View>
                    <View className="auth-card">
                        {isVerifying ? (
                            <View className="auth-form">
                                <View className="auth-field"><Text className="auth-label">Verification code</Text><TextInput className={`auth-input ${fieldErrors.code ? 'auth-input-error' : ''}`} value={code} onChangeText={(value) => { setCode(value); setFieldErrors({}); }} placeholder="Enter your code" placeholderTextColor="rgba(0, 0, 0, 0.45)" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={8} returnKeyType="done" onSubmitEditing={handleVerify} />{fieldErrors.code ? <Text className="auth-error">{fieldErrors.code}</Text> : null}</View>
                                {formError ? <Text accessibilityRole="alert" className="auth-error">{formError}</Text> : null}
                                <Pressable className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`} onPress={handleVerify} disabled={isSubmitting}>{isSubmitting ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify and continue</Text>}</Pressable>
                                <Pressable className="auth-secondary-button" onPress={handleResendCode} disabled={isSubmitting}><Text className="auth-secondary-button-text">Resend code</Text></Pressable>
                            </View>
                        ) : (
                            <View className="auth-form">
                                <View className="auth-field"><Text className="auth-label">Email</Text><TextInput className={`auth-input ${fieldErrors.email ? 'auth-input-error' : ''}`} value={email} onChangeText={(value) => { setEmail(value); setFieldErrors((current) => ({...current, email: undefined})); }} placeholder="you@example.com" placeholderTextColor="rgba(0, 0, 0, 0.45)" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />{fieldErrors.email ? <Text className="auth-error">{fieldErrors.email}</Text> : null}</View>
                                <View className="auth-field"><Text className="auth-label">Password</Text><TextInput className={`auth-input ${fieldErrors.password ? 'auth-input-error' : ''}`} value={password} onChangeText={(value) => { setPassword(value); setFieldErrors((current) => ({...current, password: undefined})); }} placeholder="Create a password" placeholderTextColor="rgba(0, 0, 0, 0.45)" secureTextEntry textContentType="newPassword" autoComplete="new-password" />{fieldErrors.password ? <Text className="auth-error">{fieldErrors.password}</Text> : <Text className="auth-helper">Use 8 or more characters.</Text>}</View>
                                <View className="auth-field"><Text className="auth-label">Confirm password</Text><TextInput className={`auth-input ${fieldErrors.confirmPassword ? 'auth-input-error' : ''}`} value={confirmPassword} onChangeText={(value) => { setConfirmPassword(value); setFieldErrors((current) => ({...current, confirmPassword: undefined})); }} placeholder="Re-enter your password" placeholderTextColor="rgba(0, 0, 0, 0.45)" secureTextEntry textContentType="newPassword" autoComplete="new-password" returnKeyType="go" onSubmitEditing={handleCreateAccount} />{fieldErrors.confirmPassword ? <Text className="auth-error">{fieldErrors.confirmPassword}</Text> : null}</View>
                                {formError ? <Text accessibilityRole="alert" className="auth-error">{formError}</Text> : null}
                                <Pressable className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`} onPress={handleCreateAccount} disabled={isSubmitting}>{isSubmitting ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Create account</Text>}</Pressable>
                                <View nativeID="clerk-captcha" />
                            </View>
                        )}
                        {!isVerifying ? <View className="auth-link-row"><Text className="auth-link-copy">Already have an account?</Text><Link href="/(auth)/sign-in" replace asChild><Pressable accessibilityRole="link"><Text className="auth-link">Sign in</Text></Pressable></Link></View> : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default SignUp;
