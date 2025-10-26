import React, { useRef } from "react";
import { Fireworks } from '@fireworks-js/react'
import type { FireworksHandlers } from '@fireworks-js/react'

interface FireworksProps extends React.HTMLAttributes<HTMLDivElement> {

}
const FireworksComponent: React.FC<FireworksProps> = ({ className }) => {
    const ref = useRef<FireworksHandlers>(null)

    return <Fireworks
        ref={ref}
        className={className}
        options={{ opacity: 0.5 }}
        style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'fixed',
        }}
    />;
};

export default FireworksComponent;
