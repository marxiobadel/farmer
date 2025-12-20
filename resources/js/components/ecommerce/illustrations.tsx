import { motion } from "framer-motion";

export const BlobBackground = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.2C93.5,8.9,82,22.1,70.8,33.4C59.6,44.7,48.7,54.1,36.6,61.9C24.5,69.7,11.2,75.9,-1.4,78.3C-14,80.7,-26.6,79.4,-38.1,73.1C-49.6,66.9,-60,55.8,-68.6,43.2C-77.2,30.6,-84,16.6,-83.4,2.9C-82.9,-10.8,-75,-24.1,-65.4,-35.6C-55.8,-47.1,-44.5,-56.8,-32.1,-65.1C-19.7,-73.4,-6.2,-80.3,3.7,-86.7L13.6,-93.1Z" transform="translate(100 100)" />
    </svg>
);

export const HenIllustration = () => (
    <motion.svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
    >
        <circle cx="250" cy="250" r="200" className="fill-primary/5" />
        <motion.path
            d="M350 250C350 305.228 305.228 350 250 350C194.772 350 150 305.228 150 250C150 194.772 194.772 150 250 150C305.228 150 350 194.772 350 250Z"
            className="fill-stone-100 stroke-stone-200"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Stylized Hen Shape */}
        <motion.path
            d="M180 280 C180 280, 160 220, 220 200 C240 190, 260 190, 280 210 C300 230, 320 230, 340 220 C340 220, 350 260, 320 280 C290 300, 250 320, 180 280 Z"
            className="fill-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        />
        {/* Eggs */}
        <motion.ellipse
            cx="280" cy="310" rx="20" ry="25"
            className="fill-amber-100 stroke-primary"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
        />
        <motion.ellipse
            cx="250" cy="320" rx="22" ry="28"
            className="fill-white stroke-stone-300"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
        />
    </motion.svg>
);

export const DeliveryIllustration = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary" xmlns="http://www.w3.org/2000/svg">
        <motion.path
            d="M5 17H19M5 17L3 13M5 17V7H15V17M19 17L21 13M19 17V11H15M3 13L5 7M21 13L19 11M15 7V3H5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
        />
        <motion.circle
            cx="9" cy="17" r="2"
            className="fill-stone-100 stroke-current"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.5 }}
        />
        <motion.circle
            cx="17" cy="17" r="2"
            className="fill-stone-100 stroke-current"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.6 }}
        />
    </svg>
);
