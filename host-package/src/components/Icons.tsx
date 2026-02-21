import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export const HeadphonesIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M21 16V18C21 19.6569 19.6569 21 18 21H17C16.4477 21 16 20.5523 16 20V15C16 14.4477 16.4477 14 17 14H21V16Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 16V18C3 19.6569 4.34315 21 6 21H7C7.55228 21 8 20.5523 8 20V15C8 14.4477 7.55228 14 7 14H3V16Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const CartIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CatalogIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const EngineIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 3V5.5M12 18.5V21M21 12H18.5M5.5 12H3M18.36 5.64L16.6 7.4M7.4 16.6L5.64 18.36M18.36 18.36L16.6 16.6M7.4 7.4L5.64 5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const BrakesIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 3V6M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3.5 8.5L6 10M18 14L20.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3.5 15.5L6 14M18 10L20.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const SuspensionIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 4L6 8L4 10L6 12L4 14L6 16L4 18L6 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 4L18 8L20 10L18 12L20 14L18 16L20 18L18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8" y="3" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="8" y="17" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 4H20V6.17157C20 6.70201 19.7893 7.21071 19.4142 7.58579L15 12V19L9 21V12L4.58579 7.58579C4.21071 7.21071 4 6.70201 4 6.17157V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ElectricIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 2L4.09 12.63C3.74 13.05 4.03 13.68 4.58 13.68H12L11 22L19.91 11.37C20.26 10.95 19.97 10.32 19.42 10.32H12L13 2Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CarIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5.5 16H3V11L5 7H19L21 11V16H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 11H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 16H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ExhaustIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 12H8C8 12 10 12 10 14V16C10 18 12 18 12 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8C14 8 15 6 17 6C19 6 20 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 11C16 11 17 9 19 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="2" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const CoolingIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.64 5.64L18.36 18.36M18.36 5.64L5.64 18.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const OilIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C12 2 6 8 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 8 12 2 12 2Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14C10 14 10 16 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const TyresIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const WrenchIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14.7 6.3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-10 10a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l10-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 20L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FireIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2C12 2 4 8 4 14C4 18.4183 7.58172 22 12 22Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 22C14.2091 22 16 19.9853 16 17.5C16 14 12 10 12 10C12 10 8 14 8 17.5C8 19.9853 9.79086 22 12 22Z" fill="currentColor" opacity="0.3"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PackageIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16.5 9.4L7.55 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 16V8C20.9996 7.6493 20.9071 7.30483 20.7315 7.00017C20.556 6.69552 20.3037 6.44082 20 6.26L13 2.26C12.696 2.07888 12.3511 1.9837 12 1.9837C11.6489 1.9837 11.304 2.07888 11 2.26L4 6.26C3.69626 6.44082 3.44398 6.69552 3.26846 7.00017C3.09294 7.30483 3.00036 7.6493 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9998C3.44398 17.3045 3.69626 17.5592 4 17.74L11 21.74C11.304 21.9211 11.6489 22.0163 12 22.0163C12.3511 22.0163 12.696 21.9211 13 21.74L20 17.74C20.3037 17.5592 20.556 17.3045 20.7315 16.9998C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 20V14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9C19.9828 7.56678 19.1209 6.28538 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CreditCardIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MessageIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AdminIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12.22 2H11.78C11.2496 2 10.7409 2.21071 10.3658 2.58579C9.99072 2.96086 9.78 3.46957 9.78 4V4.18C9.78 4.93 9.34 5.6 8.67 5.92C8.47 6.01 8.28 6.11 8.09 6.22C7.43 6.58 6.62 6.59 5.98 6.2L5.82 6.1C5.37 5.84 4.84 5.75 4.33 5.85C3.82 5.94 3.36 6.22 3.04 6.62L2.82 6.92C2.5 7.32 2.34 7.83 2.37 8.34C2.39 8.86 2.6 9.35 2.95 9.72L3.07 9.85C3.56 10.38 3.72 11.13 3.44 11.78C3.39 11.85 3.36 11.92 3.33 12C3.3 12.08 3.27 12.16 3.24 12.23C2.96 12.88 2.34 13.32 1.64 13.35L1.44 13.36C0.909567 13.39 0.412427 13.62 0.0473667 14C-0.317693 14.38 -0.525 14.88 -0.525 15.41V15.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23H11.92C11.3896 23 10.8809 22.7893 10.5058 22.4142C10.1307 22.0391 9.92 21.5304 9.92 21V20.91C9.9118 20.5793 9.80494 20.258 9.6137 19.9878C9.42247 19.7175 9.15557 19.5103 8.85 19.39C8.54836 19.2569 8.21381 19.2172 7.88941 19.276C7.56502 19.3348 7.26568 19.4895 7.03 19.72L6.97 19.78C6.78425 19.966 6.56368 20.1135 6.32088 20.2141C6.07809 20.3148 5.81778 20.3666 5.555 20.3666C5.29222 20.3666 5.03191 20.3148 4.78912 20.2141C4.54632 20.1135 4.32575 19.966 4.14 19.78C3.95405 19.5943 3.80653 19.3737 3.70588 19.1309C3.60523 18.8881 3.55343 18.6278 3.55343 18.365C3.55343 18.1022 3.60523 17.8419 3.70588 17.5991C3.80653 17.3563 3.95405 17.1357 4.14 16.95L4.2 16.89C4.43054 16.6543 4.58519 16.355 4.64398 16.0306C4.70277 15.7062 4.66312 15.3716 4.53 15.07C4.40324 14.7742 4.19284 14.522 3.92451 14.3443C3.65617 14.1666 3.34183 14.0713 3.02 14.07H2.85C2.31957 14.07 1.81086 13.8593 1.43579 13.4842C1.06071 13.1091 0.85 12.6004 0.85 12.07V11.91C0.85 11.3796 1.06071 10.8709 1.43579 10.4958C1.81086 10.1207 2.31957 9.91 2.85 9.91H2.94C3.27068 9.9018 3.59197 9.79494 3.86224 9.6037C4.1325 9.41247 4.33972 9.14557 4.46 8.84C4.59312 8.53836 4.63277 8.20381 4.57398 7.87941C4.51519 7.55502 4.36054 7.25568 4.13 7.02L4.07 6.96C3.88405 6.77425 3.73653 6.55368 3.63588 6.31088C3.53523 6.06809 3.48343 5.80778 3.48343 5.545C3.48343 5.28222 3.53523 5.02191 3.63588 4.77912C3.73653 4.53632 3.88405 4.31575 4.07 4.13C4.25575 3.94405 4.47632 3.79653 4.71912 3.69588C4.96191 3.59523 5.22222 3.54343 5.485 3.54343C5.74778 3.54343 6.00809 3.59523 6.25088 3.69588C6.49368 3.79653 6.71425 3.94405 6.9 4.13L6.96 4.19C7.19568 4.42054 7.49502 4.57519 7.81941 4.63398C8.14381 4.69277 8.47836 4.65312 8.78 4.52H8.85C9.14577 4.39324 9.39802 4.18284 9.57569 3.91451C9.75337 3.64617 9.84867 3.33183 9.85 3.01V2.85C9.85 2.31957 10.0607 1.81086 10.4358 1.43579C10.8109 1.06071 11.3196 0.85 11.85 0.85H12.01C12.5404 0.85 13.0491 1.06071 13.4242 1.43579C13.7993 1.81086 14.01 2.31957 14.01 2.85V2.94C14.0113 3.26183 14.1066 3.57617 14.2843 3.84451C14.462 4.11284 14.7142 4.32324 15.01 4.45C15.3116 4.58312 15.6462 4.62277 15.9706 4.56398C16.295 4.50519 16.5943 4.35054 16.83 4.12L16.89 4.06C17.0757 3.87405 17.2963 3.72653 17.5391 3.62588C17.7819 3.52523 18.0422 3.47343 18.305 3.47343C18.5678 3.47343 18.8281 3.52523 19.0709 3.62588C19.3137 3.72653 19.5343 3.87405 19.72 4.06C19.906 4.24575 20.0535 4.46632 20.1541 4.70912C20.2548 4.95191 20.3066 5.21222 20.3066 5.475C20.3066 5.73778 20.2548 5.99809 20.1541 6.24088C20.0535 6.48368 19.906 6.70425 19.72 6.89L19.66 6.95C19.4295 7.18568 19.2748 7.48502 19.216 7.80941C19.1572 8.13381 19.1969 8.46836 19.33 8.77V8.84C19.4568 9.13577 19.6672 9.38802 19.9355 9.56569C20.2038 9.74337 20.5182 9.83867 20.84 9.84H21.01C21.5404 9.84 22.0491 10.0507 22.4242 10.4258C22.7993 10.8009 23.01 11.3096 23.01 11.84V12C23.01 12.5304 22.7993 13.0391 22.4242 13.4142C22.0491 13.7893 21.5404 14 21.01 14H20.92C20.5982 14.0013 20.2838 14.0966 20.0155 14.2743C19.7472 14.452 19.5368 14.7042 19.41 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PercentIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21 2L19 4M19 4L22 7L18.5 10.5L15.5 7.5M19 4L15.5 7.5M15.5 7.5L12.87 10.13C13.59 11.16 14 12.42 14 13.78C14 17.2 11.2 20 7.78 20C4.36 20 1.56 17.2 1.56 13.78C1.56 10.36 4.36 7.56 7.78 7.56C9.14 7.56 10.4 7.97 11.43 8.69L15.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7.78" cy="13.78" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const DashboardIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 3.97 7.73 6.06 6.06M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.39 13.13 21.68 14.18 20.87 15.13M14.12 14.12C13.56 14.72 12.8 15.07 12 15.07C11.2 15.07 10.44 14.72 9.88 14.12C9.32 13.52 9 12.72 9 11.88C9 11.04 9.32 10.24 9.88 9.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
