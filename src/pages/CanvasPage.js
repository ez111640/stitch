import React, { useEffect } from 'react';
import * as fabric from 'fabric';

const CanvasPage = () => {
    useEffect(() => {
        const canvas = new fabric.Canvas('canvas');
        canvas.add(new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 50,
            height: 50
        }));
    }, []);

    return (
        <div>
            <h1>Canvas Page</h1>
            <canvas id="canvas" width="800" height="600" style={{ border: '1px solid #ccc' }}></canvas>
        </div>
    );
};

export default CanvasPage;
