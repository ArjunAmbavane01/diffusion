"use client"

import { ReactSketchCanvas } from 'react-sketch-canvas';

const styles = {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
};

export default function Dashboard() {
    return (
        <div className="w-full p-20 py-24">
            <div className="flex justify-center items-center w-full max-w-7xl mx-auto">
                <ReactSketchCanvas
                    style={styles}
                    width="600"
                    height="400"
                    strokeWidth={4}
                    strokeColor="red"
                />

            </div>
        </div>
    )
}
