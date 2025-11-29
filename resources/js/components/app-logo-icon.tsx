import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M24 4c2.2 0 4 1.8 4 4v2h2c1.1 0 2 .9 2 2v4h-2v-4h-3v6h-6v-6h-3v4h-2v-4c0-1.1.9-2 2-2h2V8c0-2.2 1.8-4 4-4z"
            />
            <path
                d="M10 22c0-3.3 2.7-6 6-6h16c3.3 0 6 2.7 6 6v14c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V22zm6 0h16c1.1 0 2 .9 2 2v12H14V24c0-1.1.9-2 2-2z"
            />
            <path
                d="M8 28h4v10H8c-1.1 0-2-.9-2-2V30c0-1.1.9-2 2-2zm32 0h-4v10h4c1.1 0 2-.9 2-2V30c0-1.1-.9-2-2-2z"
            />
            <path
                d="M18 36h12v6H18z"
            />
        </svg>
    );
}
