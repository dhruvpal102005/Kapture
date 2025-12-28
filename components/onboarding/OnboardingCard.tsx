import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withDelay,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingCardProps {
    message: string;
    onNext: () => void;
    buttonText?: string;
    showOptions?: boolean;
    options?: { label: string; value: string }[];
    onOptionSelect?: (value: string) => void;
    userName?: string;
}

// App Logo Component (INTVL style - coral circle with text)
const AppLogo = () => (
    <View style={styles.logoContainer}>
        <Svg width={50} height={50} viewBox="0 0 50 50">
            <Circle cx="25" cy="25" r="23" fill="#FF6B6B" />
            <SvgText
                x="25"
                y="29"
                fontSize="10"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
            >
                KAPTURE
            </SvgText>
        </Svg>
    </View>
);

export default function OnboardingCard({
    message,
    onNext,
    buttonText = 'Next',
    showOptions = false,
    options = [],
    onOptionSelect,
    userName,
}: OnboardingCardProps) {
    const translateY = useSharedValue(200);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(300, withSpring(0, { damping: 20 }));
        opacity.value = withDelay(300, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    // Replace [NAME] with actual user name if provided
    const displayMessage = userName
        ? message.replace('[NAME]', userName)
        : message;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.card}>
                <View style={styles.content}>
                    <AppLogo />
                    <Text style={styles.message}>{displayMessage}</Text>
                </View>

                {showOptions && options.length > 0 ? (
                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.optionButton}
                                onPress={() => onOptionSelect?.(option.value)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={onNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.nextButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    logoContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '400',
    },
    nextButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    nextButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    optionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    optionText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
});
