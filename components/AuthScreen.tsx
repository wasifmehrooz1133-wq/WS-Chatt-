import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { ShieldCheckIcon } from './Icons';

interface AuthScreenProps {
    onAuthenticated: () => void;
}

// A simple map of country codes to their expected phone number lengths (digits only)
const PHONE_VALIDATION_RULES: { [key: string]: { lengths: number[], hint: string } } = {
    '+1': { lengths: [10], hint: 'e.g., 555 123 4567' },    // USA/Canada
    '+44': { lengths: [10], hint: 'e.g., 7123 456789' },   // UK
    '+91': { lengths: [10], hint: 'e.g., 98765 43210' },   // India
    '+92': { lengths: [10], hint: 'e.g., 300 1234567' },   // Pakistan
    '+49': { lengths: [10, 11], hint: 'e.g., 151 12345678' }, // Germany
    '+86': { lengths: [11], hint: 'e.g., 138 1234 5678' },  // China
};


export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [countryCode, setCountryCode] = useState('+1');
    const [localNumber, setLocalNumber] = useState('');
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(60);
    const [otpError, setOtpError] = useState<string>('');
    const [phoneError, setPhoneError] = useState<string>('');
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const validatePhoneNumber = (code: string, number: string): boolean => {
        const cleanedNumber = number.replace(/[^0-9]/g, '');
        const rules = PHONE_VALIDATION_RULES[code];

        if (!cleanedNumber) {
            setPhoneError('');
            return false;
        }

        if (rules) {
            if (!rules.lengths.includes(cleanedNumber.length)) {
                setPhoneError(`Invalid number. For ${code}, it must be ${rules.lengths.join(' or ')} digits long. ${rules.hint}`);
                return false;
            }
        } else {
             // Generic fallback for unlisted country codes
            if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
                setPhoneError('Please enter a valid phone number (7-15 digits).');
                return false;
            }
        }
        
        setPhoneError('');
        return true;
    };
    
    const isPhoneValid = !phoneError && localNumber.replace(/[^0-9]/g, '').length > 0;

    useEffect(() => {
        validatePhoneNumber(countryCode, localNumber);
    }, [localNumber, countryCode]);

    useEffect(() => {
        let interval: number;
        if (step === 'otp' && timer > 0) {
            interval = window.setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);


    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePhoneNumber(countryCode, localNumber)) {
            setStep('otp');
            setTimer(60); // Reset timer on new OTP request
            // In a real app, this is where you would trigger an API call to send an OTP.
        }
    };

    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        setOtpError(''); // Clear error on new input
        const { value } = e.target;
        if (/[^0-9]/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };
    
    const handleCountryCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        let { value } = e.target;
        // Ensure it starts with '+' and only contains numbers
        if (!value.startsWith('+')) {
            value = '+' + value.replace(/[^0-9]/g, '');
        } else {
            value = '+' + value.substring(1).replace(/[^0-9]/g, '');
        }
        setCountryCode(value);
    };

    const handleVerifyOtp = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp === '123456') {
            onAuthenticated();
        } else {
            setOtpError("Incorrect verification code. Please try again.");
            setOtp(new Array(6).fill(""));
            otpInputRefs.current[0]?.focus();
        }
    };

    const handleResendOtp = () => {
        // Mock resend logic
        setTimer(60);
        setOtp(new Array(6).fill(""));
        setOtpError('');
        otpInputRefs.current[0]?.focus();
        // In a real app, you would call your API to resend the code here.
    };

    return (
        <div className="w-full h-screen bg-[#F0F2F5] flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg text-center">
                <h1 className="text-3xl font-semibold text-primary mb-4">Welcome to WS Chatt</h1>
                
                {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit}>
                        <p className="text-gray-600 mb-6">Please enter your country code and phone number to get started.</p>
                        <div className="flex space-x-2">
                             <input
                                type="tel"
                                value={countryCode}
                                onChange={handleCountryCodeChange}
                                placeholder="+1"
                                className="w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                            />
                            <input
                                type="tel"
                                value={localNumber}
                                onChange={(e) => setLocalNumber(e.target.value)}
                                placeholder="Phone number"
                                className={`w-3/4 px-4 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${phoneError ? 'focus:ring-red-500' : 'focus:ring-primary-light'}`}
                            />
                        </div>
                        {phoneError && <p className="text-red-500 text-sm mt-2 text-left">{phoneError}</p>}
                        <button type="submit" disabled={!isPhoneValid} className="w-full mt-6 bg-primary-light text-white py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Send Code
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <div>
                        <p className="text-gray-600 mb-2">For your security, please enter the 6-digit verification code we've sent to:</p>
                        <p className="font-semibold text-gray-800 mb-4">{`${countryCode} ${localNumber}`}</p>
                        <p className="text-sm text-blue-500 mb-4">(For demo purposes, your code is <strong>123456</strong>)</p>
                        
                        <div className="flex justify-center space-x-2 mb-4">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className={`w-12 h-14 text-center text-2xl border ${otpError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${otpError ? 'focus:ring-red-500' : 'focus:ring-primary-light'}`}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>
                        
                        {otpError && (
                            <p className="text-red-500 text-sm mb-4">{otpError}</p>
                        )}
                        
                        <button onClick={handleVerifyOtp} className="w-full bg-primary-light text-white py-2 rounded-lg hover:bg-primary-dark transition-colors">
                            Verify & Continue
                        </button>
                        
                        <div className="mt-4 text-sm text-gray-500">
                           {timer > 0 ? (
                                <span>You can resend the code in {timer}s</span>
                           ) : (
                                <button onClick={handleResendOtp} className="hover:underline text-primary font-semibold">
                                    Resend Code
                                </button>
                           )}
                        </div>

                        <button onClick={() => setStep('phone')} className="text-sm text-gray-500 mt-2 hover:underline">
                            Use a different number?
                        </button>
                    </div>
                )}
                
                <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    <span>Your conversations are end-to-end encrypted.</span>
                </div>
            </div>
        </div>
    );
}