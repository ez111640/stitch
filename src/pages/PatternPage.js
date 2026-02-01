import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { dmcColors } from '../data/dmcColors';
import '../styles/PatternPage.css';

const colorKey = (r, g, b) => `${r},${g},${b}`;

const symbolSet = [
    '●', '■', '▲', '◆', '✖', '✚', '○', '□', '△', '◇',
    '★', '☆', '✦', '✧', '✿', '✤', '✶', '✷', '✸', '✹',
    '✺', '✻', '✼', '✽', '✪', '✫', '✬', '✭', '✮', '✯'
];

const getSymbol = (index) => {
    if (index < symbolSet.length) return symbolSet[index];
    const first = String.fromCharCode(65 + (index % 26));
    const second = String.fromCharCode(65 + Math.floor(index / 26) % 26);
    return `${second}${first}`;
};

const getContrastColor = (r, g, b) => {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#111111' : '#ffffff';
};

const isNearWhite = (r, g, b) => r > 245 && g > 245 && b > 245;

const zoomSteps = [0.4, 0.6, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];
const getNearestZoom = (value) => {
    return zoomSteps.reduce((closest, step) =>
        Math.abs(step - value) < Math.abs(closest - value) ? step : closest
        , zoomSteps[0]);
};

const SKEIN_LENGTH_INCHES = 8.7 * 36;
const STITCH_LENGTH_INCHES_AT_14 = 1.6;
const estimateSkeins = (stitchCount, stitchesPerInch, strands) => {
    if (!stitchCount) return '0.00';
    const inchesPerStitch = (STITCH_LENGTH_INCHES_AT_14 * 14) / stitchesPerInch;
    const skeins = (stitchCount * inchesPerStitch * (strands / 2)) / SKEIN_LENGTH_INCHES;
    return skeins.toFixed(2);
};

const rebuildPaletteCounts = (pixels, paletteList) => {
    const paletteMap = new Map(
        paletteList.map((entry) => [
            colorKey(entry.color.r, entry.color.g, entry.color.b),
            { ...entry, count: 0 }
        ])
    );

    pixels.forEach((pixel) => {
        const entry = paletteMap.get(pixel.key);
        if (!entry) return;
        entry.count += 1;
    });

    return Array.from(paletteMap.values()).sort((a, b) => b.count - a.count);
};

const findClosestPaletteKey = (paletteList, target) => {
    let bestKey = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    paletteList.forEach((entry) => {
        const dr = entry.color.r - target.r;
        const dg = entry.color.g - target.g;
        const db = entry.color.b - target.b;
        const distance = dr * dr + dg * dg + db * db;
        if (distance < bestDistance) {
            bestDistance = distance;
            bestKey = colorKey(entry.color.r, entry.color.g, entry.color.b);
        }
    });
    return bestKey;
};

const getDmcByFloss = (floss) => dmcColors.find((color) => color.floss === floss);

const findNearestDmc = (r, g, b, cache) => {
    const key = colorKey(r, g, b);
    if (cache.has(key)) return cache.get(key);

    let bestDistance = Number.POSITIVE_INFINITY;
    let best = null;

    for (const color of dmcColors) {
        const dr = r - color.r;
        const dg = g - color.g;
        const db = b - color.b;
        const distance = dr * dr + dg * dg + db * db;
        if (distance < bestDistance) {
            bestDistance = distance;
            best = color;
        }
    }

    cache.set(key, best);
    return best;
};

const parseHexColor = (value) => {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized.startsWith('#')) return null;
    const hex = normalized.slice(1);
    if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b };
    }
    if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }
    return null;
};

const isNearBlack = (color) => {
    if (!color) return false;
    return color.r <= 20 && color.g <= 20 && color.b <= 20;
};

const PatternPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const canvasWrapRef = useRef(null);
    const mainPanelRef = useRef(null);
    const [palette, setPalette] = useState([]);
    const [originalPalette, setOriginalPalette] = useState([]);
    const initialColorLimit = (() => {
        const color = parseHexColor(location.state?.textColor);
        if (isNearBlack(color)) {
            return location.state?.previewBackground === 'white' ? 2 : 1;
        }
        return 12;
    })();
    const [colorLimit, setColorLimit] = useState(initialColorLimit);
    const [maxColorLimit, setMaxColorLimit] = useState(24);
    const [patternData, setPatternData] = useState(null);
    const [gridSize, setGridSize] = useState(0);
    const [cellSize, setCellSize] = useState(8);
    const [editablePixels, setEditablePixels] = useState([]);
    const [originalPixels, setOriginalPixels] = useState([]);
    const [colorOverrides, setColorOverrides] = useState({});
    const [openPickerKey, setOpenPickerKey] = useState(null);
    const [addWhiteBackgroundStitches, setAddWhiteBackgroundStitches] = useState(false);
    const [showStitchCount, setShowStitchCount] = useState(true);
    const [showSkeinEstimate, setShowSkeinEstimate] = useState(true);
    const [includeShoppingList, setIncludeShoppingList] = useState(true);
    const [shoppingRoundTo, setShoppingRoundTo] = useState(1);
    const [strandCount, setStrandCount] = useState(2);
    const [calibrationFloss, setCalibrationFloss] = useState('');
    const [enableCalibration, setEnableCalibration] = useState(false);
    const [isPaintMode, setIsPaintMode] = useState(false);
    const [paintColor, setPaintColor] = useState(null);
    const [openPaintPicker, setOpenPaintPicker] = useState(false);
    const [selectedPixel, setSelectedPixel] = useState(null);
    const [pixelPickerPos, setPixelPickerPos] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [cursorPos, setCursorPos] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [autoZoom, setAutoZoom] = useState(true);
    const previewPixelsPerInch = 40;
    const hoopState = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('stitchuation-hoop-state') || '{}');
        } catch (error) {
            return {};
        }
    })();
    const hoopShape = hoopState.hoopShape || 'circle';
    const hoopSize = hoopState.hoopSize || '6';
    const hoopPreviewDims = (() => {
        const isRectLike = (hoopShape === 'oval' || hoopShape === 'rectangle')
            && typeof hoopSize === 'string'
            && hoopSize.includes('x');
        if (isRectLike) {
            const [w, h] = hoopSize.split('x').map((value) => Number(value.trim()));
            if (Number.isFinite(w) && Number.isFinite(h)) {
                return { width: w * previewPixelsPerInch, height: h * previewPixelsPerInch };
            }
        }
        const diameter = Number(hoopSize) || 6;
        const size = diameter * previewPixelsPerInch;
        return { width: size, height: size };
    })();
    const themeStyle = (() => {
        try {
            const palette = location.state?.themePalette
                ? location.state.themePalette
                : (() => {
                    const raw = sessionStorage.getItem('stitchuation-theme');
                    return raw ? JSON.parse(raw) : null;
                })();
            if (!palette) return undefined;
            if (location.state?.themePalette) {
                sessionStorage.setItem('stitchuation-theme', JSON.stringify(palette));
            }
            return {
                '--cream': palette.cream,
                '--linen': palette.linen,
                '--latte': palette.latte,
                '--sage': palette.sage,
                '--sage-dark': palette.sageDark,
                '--ink': palette.ink,
                '--ink-soft': palette.inkSoft,
                '--card': palette.card,
                '--border': palette.latte
            };
        } catch (error) {
            return undefined;
        }
    })();

    useEffect(() => {
        const source = location.state?.circleImage;
        if (!source || !canvasRef.current) return;

        const stitchesPerInch = 14;
        const resolvedHoopDiameterInches = (() => {
            if (hoopShape === 'oval' && typeof hoopSize === 'string' && hoopSize.includes('x')) {
                const [w, h] = hoopSize.split('x').map((value) => Number(value.trim()));
                if (Number.isFinite(w) && Number.isFinite(h)) {
                    return Math.max(w, h);
                }
            }
            return Number(hoopSize) || 6;
        })();
        const gridSize = Math.max(40, Math.round(resolvedHoopDiameterInches * stitchesPerInch));
        const cellSize = 8;
        const image = new Image();

        image.onload = () => {
            const offscreen = document.createElement('canvas');
            offscreen.width = gridSize;
            offscreen.height = gridSize;
            const offCtx = offscreen.getContext('2d');
            if (!offCtx) return;

            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(0, 0, gridSize, gridSize);
            offCtx.drawImage(image, 0, 0, gridSize, gridSize);
            const imageData = offCtx.getImageData(0, 0, gridSize, gridSize);

            const canvas = canvasRef.current;
            canvas.width = gridSize * cellSize;
            canvas.height = gridSize * cellSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const paletteMap = new Map();
            const dmcCache = new Map();
            const pixelData = [];

            for (let y = 0; y < gridSize; y += 1) {
                for (let x = 0; x < gridSize; x += 1) {
                    const idx = (y * gridSize + x) * 4;
                    const r = imageData.data[idx];
                    const g = imageData.data[idx + 1];
                    const b = imageData.data[idx + 2];
                    const a = imageData.data[idx + 3];

                    const finalR = a === 0 ? 255 : r;
                    const finalG = a === 0 ? 255 : g;
                    const finalB = a === 0 ? 255 : b;

                    const nearest = findNearestDmc(finalR, finalG, finalB, dmcCache);
                    if (!nearest) continue;

                    pixelData.push({ x, y, color: nearest });

                    const key = colorKey(nearest.r, nearest.g, nearest.b);
                    paletteMap.set(key, {
                        color: nearest,
                        count: (paletteMap.get(key)?.count || 0) + 1
                    });
                }
            }

            const fullPalette = Array.from(paletteMap.values())
                .sort((a, b) => b.count - a.count);

            const forceBlackWhite =
                addWhiteBackgroundStitches &&
                location.state?.previewBackground === 'white' &&
                isNearBlack(parseHexColor(location.state?.textColor));

            const filteredPalette = addWhiteBackgroundStitches
                ? fullPalette
                : fullPalette.filter(
                    (entry) => !isNearWhite(entry.color.r, entry.color.g, entry.color.b)
                );

            let limitedSet = [];
            if (forceBlackWhite) {
                const blackColor = findNearestDmc(0, 0, 0, dmcCache);
                const whiteColor = findNearestDmc(255, 255, 255, dmcCache);
                const unique = new Map();
                [blackColor, whiteColor].forEach((color) => {
                    if (!color) return;
                    unique.set(colorKey(color.r, color.g, color.b), color);
                });
                limitedSet = Array.from(unique.values());
                setMaxColorLimit(2);
                setColorLimit(2);
            } else {
                const maxColors = Math.max(2, filteredPalette.length);
                const effectiveLimit = Math.min(colorLimit, maxColors);
                setMaxColorLimit(maxColors);
                setColorLimit((prev) => Math.min(prev, maxColors));

                const limitedPalette = filteredPalette.slice(0, Math.max(2, effectiveLimit));
                limitedSet = limitedPalette.map((entry) => entry.color);
            }

            const limitedCache = new Map();
            const findNearestLimited = (r, g, b) => {
                const key = colorKey(r, g, b);
                if (limitedCache.has(key)) return limitedCache.get(key);
                let best = limitedSet[0];
                let bestDistance = Number.POSITIVE_INFINITY;
                for (const color of limitedSet) {
                    const dr = r - color.r;
                    const dg = g - color.g;
                    const db = b - color.b;
                    const distance = dr * dr + dg * dg + db * db;
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = color;
                    }
                }
                limitedCache.set(key, best);
                return best;
            };

            const symbolMap = new Map();
            limitedSet.forEach((color, index) => {
                symbolMap.set(colorKey(color.r, color.g, color.b), getSymbol(index));
            });

            const limitedPaletteMap = new Map();

            pixelData.forEach((pixel) => {
                if (!addWhiteBackgroundStitches && isNearWhite(pixel.color.r, pixel.color.g, pixel.color.b)) {
                    return;
                }
                const nearest = findNearestLimited(pixel.color.r, pixel.color.g, pixel.color.b);
                const key = colorKey(nearest.r, nearest.g, nearest.b);
                limitedPaletteMap.set(key, {
                    color: nearest,
                    count: (limitedPaletteMap.get(key)?.count || 0) + 1,
                    symbol: symbolMap.get(key)
                });

                ctx.fillStyle = `rgb(${nearest.r}, ${nearest.g}, ${nearest.b})`;
                ctx.fillRect(pixel.x * cellSize, pixel.y * cellSize, cellSize, cellSize);
            });

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= gridSize; x += 1) {
                ctx.beginPath();
                ctx.moveTo(x * cellSize + 0.5, 0);
                ctx.lineTo(x * cellSize + 0.5, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= gridSize; y += 1) {
                ctx.beginPath();
                ctx.moveTo(0, y * cellSize + 0.5);
                ctx.lineTo(canvas.width, y * cellSize + 0.5);
                ctx.stroke();
            }

            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            pixelData.forEach((pixel) => {
                const nearest = findNearestLimited(pixel.color.r, pixel.color.g, pixel.color.b);
                const key = colorKey(nearest.r, nearest.g, nearest.b);
                const symbol = symbolMap.get(key);
                if (!symbol) return;
                ctx.fillStyle = getContrastColor(nearest.r, nearest.g, nearest.b);
                ctx.fillText(
                    symbol,
                    pixel.x * cellSize + cellSize / 2,
                    pixel.y * cellSize + cellSize / 2
                );
            });

            const paletteList = Array.from(limitedPaletteMap.values())
                .filter((entry) => addWhiteBackgroundStitches || !isNearWhite(entry.color.r, entry.color.g, entry.color.b))
                .sort((a, b) => b.count - a.count);

            const pixels = pixelData.map((pixel) => {
                if (!addWhiteBackgroundStitches && isNearWhite(pixel.color.r, pixel.color.g, pixel.color.b)) {
                    return { x: pixel.x, y: pixel.y, key: null };
                }
                const nearest = findNearestLimited(pixel.color.r, pixel.color.g, pixel.color.b);
                return { x: pixel.x, y: pixel.y, key: colorKey(nearest.r, nearest.g, nearest.b) };
            });

            setPalette(paletteList);
            setOriginalPalette(paletteList);
            setGridSize(gridSize);
            setCellSize(cellSize);
            setEditablePixels(pixels);
            setOriginalPixels(pixels);
            setPatternData({ gridSize, cellSize });
        };

        image.src = source;
    }, [location.state, colorLimit, addWhiteBackgroundStitches, hoopShape, hoopSize]);

    useEffect(() => {
        if (!autoZoom) return;
        if (!mainPanelRef.current || gridSize === 0 || cellSize === 0) return;
        const baseSize = gridSize * cellSize;
        const panelWidth = mainPanelRef.current.clientWidth;
        const containerWidth = mainPanelRef.current.parentElement?.clientWidth || panelWidth;
        const sidebarMin = 620;
        const availableForPattern = Math.max(0, containerWidth - sidebarMin - 32);
        const innerWidth = Math.max(0, Math.min(panelWidth - 36 - 20, availableForPattern));
        if (innerWidth === 0) return;
        const fitZoom = Math.max(zoomSteps[0], Math.min(zoomSteps[zoomSteps.length - 1], innerWidth / baseSize));
        setZoom(getNearestZoom(fitZoom));
    }, [autoZoom, gridSize, cellSize]);

    useEffect(() => {
        if (!patternData || !canvasRef.current || editablePixels.length === 0) return;

        const canvas = canvasRef.current;
        canvas.width = gridSize * cellSize;
        canvas.height = gridSize * cellSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const baseSize = gridSize * cellSize;
        const scaledCellSize = cellSize * zoom;
        const zoomOffset = (baseSize - gridSize * scaledCellSize) / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const paletteMap = new Map(
            palette.map((entry) => [
                colorKey(entry.color.r, entry.color.g, entry.color.b),
                entry
            ])
        );

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        editablePixels.forEach((pixel) => {
            const entry = paletteMap.get(pixel.key);
            if (!entry) return;
            const override = colorOverrides[pixel.key];
            const color = override || entry.color;
            if (!addWhiteBackgroundStitches && isNearWhite(color.r, color.g, color.b)) return;
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(
                zoomOffset + pixel.x * scaledCellSize,
                zoomOffset + pixel.y * scaledCellSize,
                scaledCellSize,
                scaledCellSize
            );
        });

        const minorStroke = 'rgba(0, 0, 0, 0.15)';
        const majorStroke = 'rgba(0, 0, 0, 0.35)';
        const majorInterval = 10;
        ctx.lineWidth = 1;
        for (let x = 0; x <= gridSize; x += 1) {
            ctx.beginPath();
            const lineX = zoomOffset + x * scaledCellSize + 0.5;
            ctx.strokeStyle = x % majorInterval === 0 ? majorStroke : minorStroke;
            ctx.moveTo(lineX, zoomOffset);
            ctx.lineTo(lineX, zoomOffset + gridSize * scaledCellSize);
            ctx.stroke();
        }
        for (let y = 0; y <= gridSize; y += 1) {
            ctx.beginPath();
            const lineY = zoomOffset + y * scaledCellSize + 0.5;
            ctx.strokeStyle = y % majorInterval === 0 ? majorStroke : minorStroke;
            ctx.moveTo(zoomOffset, lineY);
            ctx.lineTo(zoomOffset + gridSize * scaledCellSize, lineY);
            ctx.stroke();
        }

        const symbolSize = Math.max(6, 10 * zoom);
        ctx.font = `${symbolSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        editablePixels.forEach((pixel) => {
            const entry = paletteMap.get(pixel.key);
            if (!entry) return;
            const override = colorOverrides[pixel.key];
            const color = override || entry.color;
            if (!addWhiteBackgroundStitches && isNearWhite(color.r, color.g, color.b)) return;
            ctx.fillStyle = getContrastColor(color.r, color.g, color.b);
            ctx.fillText(
                entry.symbol,
                zoomOffset + pixel.x * scaledCellSize + scaledCellSize / 2,
                zoomOffset + pixel.y * scaledCellSize + scaledCellSize / 2
            );
        });
    }, [patternData, editablePixels, palette, colorOverrides, addWhiteBackgroundStitches, gridSize, cellSize, zoom]);

    useEffect(() => {
        if (!patternData || !previewCanvasRef.current || editablePixels.length === 0) return;
        const canvas = previewCanvasRef.current;
        canvas.width = hoopPreviewDims.width;
        canvas.height = hoopPreviewDims.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const paletteMap = new Map(
            palette.map((entry) => [
                colorKey(entry.color.r, entry.color.g, entry.color.b),
                entry
            ])
        );

        const cellSize = Math.min(hoopPreviewDims.width, hoopPreviewDims.height) / gridSize;
        const offsetX = (hoopPreviewDims.width - gridSize * cellSize) / 2;
        const offsetY = (hoopPreviewDims.height - gridSize * cellSize) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        editablePixels.forEach((pixel) => {
            const entry = paletteMap.get(pixel.key);
            if (!entry) return;
            const override = colorOverrides[pixel.key];
            const color = override || entry.color;
            if (!addWhiteBackgroundStitches && isNearWhite(color.r, color.g, color.b)) return;
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(
                offsetX + pixel.x * cellSize,
                offsetY + pixel.y * cellSize,
                cellSize,
                cellSize
            );
        });
    }, [patternData, editablePixels, palette, colorOverrides, hoopPreviewDims, addWhiteBackgroundStitches, gridSize]);

    const applyCalibration = React.useCallback(() => {
        if (!enableCalibration || !calibrationFloss) return;
        const rawTarget = getDmcByFloss(calibrationFloss);
        if (!rawTarget || palette.length === 0) return;

        let target = rawTarget;
        if (!addWhiteBackgroundStitches && isNearWhite(rawTarget.r, rawTarget.g, rawTarget.b)) {
            let best = null;
            let bestDistance = Number.POSITIVE_INFINITY;
            dmcColors.forEach((color) => {
                if (isNearWhite(color.r, color.g, color.b)) return;
                const dr = color.r - rawTarget.r;
                const dg = color.g - rawTarget.g;
                const db = color.b - rawTarget.b;
                const distance = dr * dr + dg * dg + db * db;
                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = color;
                }
            });
            if (best) target = best;
        }

        const anchorKey = findClosestPaletteKey(palette, target);
        if (!anchorKey) return;
        const anchorEntry = palette.find(
            (entry) => colorKey(entry.color.r, entry.color.g, entry.color.b) === anchorKey
        );
        if (!anchorEntry) return;

        const delta = {
            r: target.r - anchorEntry.color.r,
            g: target.g - anchorEntry.color.g,
            b: target.b - anchorEntry.color.b
        };

        const clamp = (value) => Math.max(0, Math.min(255, value));
        const dmcCache = new Map();
        const nextOverrides = {};

        palette.forEach((entry) => {
            if (isNearWhite(entry.color.r, entry.color.g, entry.color.b)) {
                return;
            }
            const shifted = {
                r: clamp(entry.color.r + delta.r),
                g: clamp(entry.color.g + delta.g),
                b: clamp(entry.color.b + delta.b)
            };

            let nearest = findNearestDmc(shifted.r, shifted.g, shifted.b, dmcCache);
            if (!nearest) return;
            if (!addWhiteBackgroundStitches && isNearWhite(nearest.r, nearest.g, nearest.b)) {
                let best = null;
                let bestDistance = Number.POSITIVE_INFINITY;
                dmcColors.forEach((color) => {
                    if (isNearWhite(color.r, color.g, color.b)) return;
                    const dr = color.r - shifted.r;
                    const dg = color.g - shifted.g;
                    const db = color.b - shifted.b;
                    const distance = dr * dr + dg * dg + db * db;
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = color;
                    }
                });
                if (best) nearest = best;
            }

            const key = colorKey(entry.color.r, entry.color.g, entry.color.b);
            nextOverrides[key] = nearest;
        });

        setColorOverrides(nextOverrides);
    }, [enableCalibration, calibrationFloss, palette, addWhiteBackgroundStitches]);

    useEffect(() => {
        applyCalibration();
    }, [applyCalibration]);

    const applyPixelColor = (x, y, color) => {
        if (!addWhiteBackgroundStitches && isNearWhite(color.r, color.g, color.b)) {
            return;
        }
        const paintKey = colorKey(color.r, color.g, color.b);

        setEditablePixels((prev) => {
            const updatedPixels = prev.map((pixel) =>
                pixel.x === x && pixel.y === y ? { ...pixel, key: paintKey } : pixel
            );

            setPalette((prevPalette) => {
                const exists = prevPalette.some(
                    (entry) => colorKey(entry.color.r, entry.color.g, entry.color.b) === paintKey
                );
                const nextPalette = exists
                    ? prevPalette
                    : [
                        ...prevPalette,
                        {
                            color,
                            count: 0,
                            symbol: getSymbol(prevPalette.length)
                        }
                    ];
                return rebuildPaletteCounts(updatedPixels, nextPalette);
            });

            return updatedPixels;
        });
    };



    const getGridCoords = (event) => {
        if (!gridSize) return null;
        const rect = event.currentTarget.getBoundingClientRect();
        const scaleX = event.currentTarget.width / rect.width;
        const scaleY = event.currentTarget.height / rect.height;
        const baseSize = gridSize * cellSize;
        const scaledCellSize = cellSize * zoom;
        const zoomOffset = (baseSize - gridSize * scaledCellSize) / 2;
        const rawX = (event.clientX - rect.left) * scaleX;
        const rawY = (event.clientY - rect.top) * scaleY;
        const unzoomedX = rawX - zoomOffset;
        const unzoomedY = rawY - zoomOffset;
        const x = Math.floor(unzoomedX / scaledCellSize);
        const y = Math.floor(unzoomedY / scaledCellSize);
        if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return null;
        return { x, y, rect };
    };

    const handleCanvasClick = (event) => {
        if (!isPaintMode) return;
        const coords = getGridCoords(event);
        if (!coords) return;
        const { x, y } = coords;

        if (paintColor) {
            applyPixelColor(x, y, paintColor);
        }
    };

    const handleCanvasPointerDown = (event) => {
        if (!isPaintMode || event.button !== 0 || !paintColor) return;
        const coords = getGridCoords(event);
        if (!coords) return;
        setIsDragging(true);
        applyPixelColor(coords.x, coords.y, paintColor);
    };

    const handleCanvasPointerMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setCursorPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
        if (!isPaintMode || !isDragging || !paintColor) return;
        const coords = getGridCoords(event);
        if (!coords) return;
        applyPixelColor(coords.x, coords.y, paintColor);
    };

    const handleCanvasPointerUp = () => {
        setIsDragging(false);
    };

    const handleResetEdits = () => {
        setEditablePixels(originalPixels);
        setPalette(originalPalette);
        setColorOverrides({});
    };

    const handlePrintPattern = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const paletteRows = palette
            .map((entry) => {
                const key = colorKey(entry.color.r, entry.color.g, entry.color.b);
                const override = colorOverrides[key];
                const displayColor = override || entry.color;
                const swatch = `rgb(${displayColor.r}, ${displayColor.g}, ${displayColor.b})`;
                return `
                    <div class="palette-item">
                        <span class="swatch" style="background:${swatch}"></span>
                        <span class="label">${entry.color.floss} ${entry.color.name}</span>
                    </div>
                `;
            })
            .join('');
        const roundTo = shoppingRoundTo;
        const roundSkeins = (value) => {
            if (!Number.isFinite(value) || !roundTo) return value;
            return Math.ceil(value / roundTo) * roundTo;
        };

        const shoppingRows = palette
            .map((entry) => {
                const key = colorKey(entry.color.r, entry.color.g, entry.color.b);
                const override = colorOverrides[key];
                const displayColor = override || entry.color;
                const swatch = `rgb(${displayColor.r}, ${displayColor.g}, ${displayColor.b})`;
                const skeinsRaw = Number(estimateSkeins(entry.count, 14, strandCount));
                const skeinsRounded = roundSkeins(skeinsRaw);
                const skeinsLabel = Number.isFinite(skeinsRounded)
                    ? (roundTo === 1 ? Math.round(skeinsRounded).toString() : skeinsRounded.toFixed(2))
                    : skeinsRaw;
                return `
                    <div class="shopping-item">
                        <span class="swatch" style="background:${swatch}"></span>
                        <span class="label">${entry.color.floss} ${entry.color.name}</span>
                        <span class="meta">: ${skeinsLabel} skeins</span>
                    </div>
                `;
            })
            .join('');
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;
        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>Cross Stitch Pattern</title>
                    <style>
                        body { margin: 0; padding: 24px; font-family: Arial, sans-serif; }
                        h1 { font-size: 18px; margin: 0 0 16px; }
                        img { max-width: 100%; height: auto; border: 1px solid #ccc; }
                        .palette { margin-top: 18px; column-count: 3; column-gap: 18px; }
                        .shopping { margin-top: 18px; }
                        .palette-item { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; break-inside: avoid; }
                        .shopping-item { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; break-inside: avoid; }
                        .swatch { width: 16px; height: 16px; border: 1px solid #999; border-radius: 3px; display: inline-block; }
                        .swatch, img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .label { font-size: 12px; font-weight: 600; }
                        .meta { font-size: 11px; color: #555; }
                        @media print {
                            .palette, .shopping { break-inside: avoid; page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Cross Stitch Pattern</h1>
                    <img src="${dataUrl}" alt="Cross stitch pattern" onload="window.print(); window.close();" />
                    <div class="palette">
                        ${paletteRows}
                    </div>
                    ${includeShoppingList ? `
                        <div class="shopping">
                            ${shoppingRows}
                        </div>
                    ` : ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    };

    if (!location.state?.circleImage) {
        return (
            <div style={{ padding: '24px' }}>
                <h2>No pattern data</h2>
                <p>Go back and generate a pattern from the editor.</p>
                <button type="button" onClick={() => navigate('/')}>
                    Back to Editor
                </button>
            </div>
        );
    }

    return (
        <div className="pattern-page" style={themeStyle}>
            <div className="pattern-panel pattern-main-panel" ref={mainPanelRef}>
                <div className="pattern-header">
                    <h2>Cross Stitch Pattern</h2>
                    <div className="pattern-controls">
                        <span>Zoom:</span>
                        <button
                            type="button"
                            className="pattern-reset"
                            onClick={() => {
                                setAutoZoom(false);
                                const currentIndex = zoomSteps.indexOf(getNearestZoom(zoom));
                                const nextIndex = Math.max(0, currentIndex - 1);
                                setZoom(zoomSteps[nextIndex]);
                            }}
                            disabled={getNearestZoom(zoom) === zoomSteps[0]}
                        >
                            −
                        </button>
                        <span>{Math.round(getNearestZoom(zoom) * 100)}%</span>
                        <button
                            type="button"
                            className="pattern-reset"
                            onClick={() => {
                                setAutoZoom(false);
                                const currentIndex = zoomSteps.indexOf(getNearestZoom(zoom));
                                const nextIndex = Math.min(zoomSteps.length - 1, currentIndex + 1);
                                setZoom(zoomSteps[nextIndex]);
                            }}
                            disabled={getNearestZoom(zoom) === zoomSteps[zoomSteps.length - 1]}
                        >
                            +
                        </button>
                        <button type="button" className="pattern-reset" onClick={handlePrintPattern}>
                            Print
                        </button>
                    </div>
                </div>
                <div className="pattern-canvas-wrap" ref={canvasWrapRef}>
                    <canvas
                        ref={canvasRef}
                        className="pattern-canvas"
                        onClick={handleCanvasClick}
                        onPointerDown={handleCanvasPointerDown}
                        onPointerMove={handleCanvasPointerMove}
                        onPointerUp={handleCanvasPointerUp}
                        onPointerLeave={handleCanvasPointerUp}
                    ></canvas>
                    {isPaintMode && paintColor && cursorPos && (
                        <div
                            className="pattern-cursor-swatch"
                            style={{
                                left: `${cursorPos.x + 8}px`,
                                top: `${cursorPos.y + 8}px`,
                                background: `rgb(${paintColor.r}, ${paintColor.g}, ${paintColor.b})`
                            }}
                        />
                    )}
                    {selectedPixel && pixelPickerPos && !isPaintMode && (
                        <div
                            className="pattern-pixel-picker"
                            style={{ left: `${pixelPickerPos.x}px`, top: `${pixelPickerPos.y}px` }}
                        >
                            <label className="pattern-pixel-picker-title" htmlFor="pixelColorSelect">
                                Pick a color
                            </label>
                            <select
                                id="pixelColorSelect"
                                className="pattern-pixel-select"
                                onChange={(event) => {
                                    const selectedFloss = event.target.value;
                                    const quickPick = palette.find((entry) => entry.color.floss === selectedFloss);
                                    const option = quickPick?.color || dmcColors.find((item) => item.floss === selectedFloss);
                                    if (!option) return;
                                    applyPixelColor(selectedPixel.x, selectedPixel.y, option);
                                    setPaintColor(option);
                                    setIsPaintMode(true);
                                    setSelectedPixel(null);
                                    setPixelPickerPos(null);
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a color
                                </option>
                                <optgroup label="Quick picks">
                                    {palette
                                        .filter((entry) => addWhiteBackgroundStitches || !isNearWhite(entry.color.r, entry.color.g, entry.color.b))
                                        .map((entry) => (
                                            <option
                                                key={`quick-${entry.color.floss}`}
                                                value={entry.color.floss}
                                                style={{
                                                    background: `rgb(${entry.color.r}, ${entry.color.g}, ${entry.color.b})`,
                                                    color: getContrastColor(entry.color.r, entry.color.g, entry.color.b)
                                                }}
                                            >
                                                {entry.symbol} {entry.color.floss} {entry.color.name}
                                            </option>
                                        ))}
                                </optgroup>
                                <optgroup label="All DMC colors">
                                    {dmcColors
                                        .filter((option) => addWhiteBackgroundStitches || !isNearWhite(option.r, option.g, option.b))
                                        .map((option) => (
                                            <option
                                                key={`all-${option.floss}`}
                                                value={option.floss}
                                                style={{
                                                    background: `rgb(${option.r}, ${option.g}, ${option.b})`,
                                                    color: getContrastColor(option.r, option.g, option.b)
                                                }}
                                            >
                                                {option.floss} {option.name}
                                            </option>
                                        ))}
                                </optgroup>
                            </select>
                            <button
                                type="button"
                                className="pattern-pixel-close"
                                onClick={() => {
                                    setSelectedPixel(null);
                                    setPixelPickerPos(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
                <div className="pattern-main-actions">
                    <button type="button" className="pattern-reset" onClick={handleResetEdits}>
                        Reset edits
                    </button>
                    <button type="button" className="pattern-reset" onClick={() => navigate('/')}>
                        Back to Editor
                    </button>
                </div>
            </div>
            <div className="pattern-sidebar">
                <div className="pattern-side-row">
                    <div className="pattern-side-column">
                        <div className="pattern-panel pattern-hoop-panel">
                            <h3>Hoop Preview</h3>
                            <div
                                className={`pattern-hoop-preview pattern-hoop-preview-${hoopShape}`}
                                style={{
                                    width: '100%',
                                    maxWidth: `${hoopPreviewDims.width}px`,
                                    aspectRatio: (hoopShape === 'circle' || hoopShape === 'square')
                                        ? '1 / 1'
                                        : `${hoopPreviewDims.width} / ${hoopPreviewDims.height}`
                                }}
                            >
                                {patternData ? (
                                    <canvas
                                        ref={previewCanvasRef}
                                        aria-label="Hoop preview"
                                        className="pattern-hoop-canvas"
                                        style={{ imageRendering: 'pixelated' }}
                                    ></canvas>
                                ) : (
                                    <span>No preview</span>
                                )}
                            </div>
                        </div>
                        <div className="pattern-panel pattern-settings-panel">
                            <h3>Settings</h3>
                            <div className="pattern-settings">
                                <div className="pattern-setting-row">
                                    <label className="pattern-setting-item">
                                        <input
                                            type="checkbox"
                                            checked={addWhiteBackgroundStitches}
                                            onChange={(event) => setAddWhiteBackgroundStitches(event.target.checked)}
                                        />
                                        <span>Add white background stitches</span>
                                        <span
                                            className="pattern-setting-help"
                                            data-tooltip="Include white stitches so background areas are filled."
                                        >
                                            ?
                                        </span>
                                    </label>
                                </div>
                                <div className="pattern-setting-row">
                                    <label className="pattern-setting-item">
                                        <input
                                            type="checkbox"
                                            checked={showStitchCount}
                                            onChange={(event) => setShowStitchCount(event.target.checked)}
                                        />
                                        <span>Show stitch count</span>
                                        <span
                                            className="pattern-setting-help"
                                            data-tooltip="Display the total stitches per color in the palette."
                                        >
                                            ?
                                        </span>
                                    </label>
                                </div>
                                <div className={`pattern-setting-group ${showSkeinEstimate ? '' : 'is-disabled'}`}>
                                    <div className="pattern-setting-row">
                                        <label className="pattern-setting-item pattern-setting-parent">
                                            <input
                                                type="checkbox"
                                                checked={showSkeinEstimate}
                                                onChange={(event) => setShowSkeinEstimate(event.target.checked)}
                                            />
                                            <span>Show skein estimate</span>
                                            <span
                                                className="pattern-setting-help"
                                                data-tooltip="Estimate skeins per color using stitch count and strands."
                                            >
                                                ?
                                            </span>
                                        </label>
                                    </div>
                                    <label className="pattern-setting-item pattern-setting-indent pattern-setting-child">
                                        <span>Strands:</span>
                                        <select
                                            value={strandCount}
                                            onChange={(event) => setStrandCount(Number(event.target.value))}
                                            disabled={!showSkeinEstimate}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map((count) => (
                                                <option key={count} value={count}>
                                                    {count}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="pattern-setting-row">
                                    <label className="pattern-setting-item">
                                        <input
                                            type="checkbox"
                                            checked={includeShoppingList}
                                            onChange={(event) => setIncludeShoppingList(event.target.checked)}
                                        />
                                        <span>Include floss shopping list in print</span>
                                        <span
                                            className="pattern-setting-help"
                                            data-tooltip="Adds a shopping list section to printed patterns."
                                        >
                                            ?
                                        </span>
                                    </label>
                                </div>
                                <label className="pattern-setting-item pattern-setting-indent">
                                    <span>Round to nearest:</span>
                                    <select
                                        value={shoppingRoundTo}
                                        onChange={(event) => setShoppingRoundTo(Number(event.target.value))}
                                    >
                                        <option value={1}>1</option>
                                        <option value={0.75}>0.75</option>
                                        <option value={0.5}>0.5</option>
                                        <option value={0.25}>0.25</option>
                                    </select>
                                </label>
                                <div className={`pattern-setting-group ${isPaintMode ? '' : 'is-disabled'}`}>
                                    <div className="pattern-setting-row">
                                        <label className="pattern-setting-item pattern-setting-parent">
                                            <input
                                                type="checkbox"
                                                checked={isPaintMode}
                                                onChange={(event) => setIsPaintMode(event.target.checked)}
                                            />
                                            <span>Edit individual blocks</span>
                                            <span
                                                className="pattern-setting-help"
                                                data-tooltip="Enable paint mode to recolor individual blocks."
                                            >
                                                ?
                                            </span>
                                        </label>
                                    </div>
                                    <label className="pattern-setting-item pattern-setting-indent pattern-setting-child">
                                        <span>Paint color:</span>
                                        <div className="pattern-picker-anchor">
                                            <button
                                                type="button"
                                                className="pattern-paint-swatch"
                                                onClick={() => {
                                                    if (!isPaintMode) return;
                                                    setOpenPaintPicker((prev) => !prev);
                                                }}
                                                disabled={!isPaintMode}
                                                style={{
                                                    background: paintColor
                                                        ? `rgb(${paintColor.r}, ${paintColor.g}, ${paintColor.b})`
                                                        : '#ffffff'
                                                }}
                                            ></button>
                                            {openPaintPicker && isPaintMode && (
                                                <div className="pattern-picker-menu">
                                                    {dmcColors.map((option) => (
                                                        <button
                                                            key={option.floss}
                                                            type="button"
                                                            onClick={() => {
                                                                setPaintColor(option);
                                                                setOpenPaintPicker(false);
                                                            }}
                                                            className="pattern-picker-option"
                                                        >
                                                            <span
                                                                className="pattern-picker-swatch"
                                                                style={{ background: `rgb(${option.r}, ${option.g}, ${option.b})` }}
                                                            ></span>
                                                            <span>{option.floss}</span>
                                                            <span>{option.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                                <div className={`pattern-setting-group ${enableCalibration ? '' : 'is-disabled'}`}>
                                    <div className="pattern-setting-row">
                                        <label className="pattern-setting-item pattern-setting-parent">
                                            <input
                                                type="checkbox"
                                                checked={enableCalibration}
                                                onChange={(event) => setEnableCalibration(event.target.checked)}
                                            />
                                            <span>Calibrate palette based on this DMC color</span>
                                            <span
                                                className="pattern-setting-help"
                                                data-tooltip="Bias the palette toward a selected DMC color."
                                            >
                                                ?
                                            </span>
                                        </label>
                                    </div>
                                    <label className="pattern-setting-item pattern-setting-indent pattern-setting-child">
                                        <span>Color:</span>
                                        <select
                                            value={calibrationFloss}
                                            onChange={(event) => {
                                                setCalibrationFloss(event.target.value);
                                                setEnableCalibration(true);
                                            }}
                                            disabled={!enableCalibration}
                                            style={{
                                                background: calibrationFloss
                                                    ? `rgb(${getDmcByFloss(calibrationFloss)?.r ?? 255}, ${getDmcByFloss(calibrationFloss)?.g ?? 255}, ${getDmcByFloss(calibrationFloss)?.b ?? 255})`
                                                    : '#ffffff',
                                                color: calibrationFloss
                                                    ? getContrastColor(
                                                        getDmcByFloss(calibrationFloss)?.r ?? 255,
                                                        getDmcByFloss(calibrationFloss)?.g ?? 255,
                                                        getDmcByFloss(calibrationFloss)?.b ?? 255
                                                    )
                                                    : 'inherit'
                                            }}
                                        >
                                            <option value="">Select a color</option>
                                            {dmcColors
                                                .filter((option) => addWhiteBackgroundStitches || !isNearWhite(option.r, option.g, option.b))
                                                .map((option) => (
                                                    <option
                                                        key={`calibrate-${option.floss}`}
                                                        value={option.floss}
                                                        style={{
                                                            background: `rgb(${option.r}, ${option.g}, ${option.b})`,
                                                            color: getContrastColor(option.r, option.g, option.b)
                                                        }}
                                                    >
                                                        {option.floss} {option.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                </div>
                                <button type="button" className="pattern-reset" onClick={handleResetEdits}>
                                    Reset edits
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="pattern-panel pattern-palette">
                        <div className="pattern-palette-header">
                            <h3>Palette</h3>
                            <div className="pattern-palette-controls">
                                <label htmlFor="colorLimit">Number of Colors:</label>
                                <input
                                    id="colorLimit"
                                    type="range"
                                    min="2"
                                    max={maxColorLimit}
                                    value={colorLimit}
                                    onChange={(event) =>
                                        setColorLimit(
                                            Math.min(Number(event.target.value), maxColorLimit)
                                        )
                                    }
                                />
                                <span>{colorLimit}</span>
                            </div>
                        </div>
                        <div className="pattern-palette-list">
                            {palette.map((entry) => {
                                const { color, count, symbol } = entry;
                                const key = colorKey(color.r, color.g, color.b);
                                const override = colorOverrides[key];
                                const displayColor = override || color;
                                const symbolColor = getContrastColor(displayColor.r, displayColor.g, displayColor.b);
                                const stitchCountLabel = `Number of Stitches: ${count}`;
                                const skeinLabel = `Estimated skeins (${strandCount} strands): ${estimateSkeins(count, 14, strandCount)}`;
                                return (
                                    <div key={color.floss} className="pattern-palette-item">
                                        <div className="pattern-picker-anchor">
                                            <button
                                                type="button"
                                                onClick={() => setOpenPickerKey(openPickerKey === key ? null : key)}
                                                className="pattern-picker-button"
                                                style={{ background: `rgb(${displayColor.r}, ${displayColor.g}, ${displayColor.b})` }}
                                                aria-label="Choose DMC color"
                                            >
                                                <span className="pattern-swatch-symbol" style={{ color: symbolColor }}>
                                                    {symbol}
                                                </span>
                                            </button>
                                            {openPickerKey === key && (
                                                <div className="pattern-picker-menu">
                                                    {dmcColors.map((option) => (
                                                        <button
                                                            key={option.floss}
                                                            type="button"
                                                            onClick={() => {
                                                                setColorOverrides((prev) => ({
                                                                    ...prev,
                                                                    [key]: option
                                                                }));
                                                                setOpenPickerKey(null);
                                                            }}
                                                            className="pattern-picker-option"
                                                        >
                                                            <span
                                                                className="pattern-picker-swatch"
                                                                style={{ background: `rgb(${option.r}, ${option.g}, ${option.b})` }}
                                                            ></span>
                                                            <span>{option.floss}</span>
                                                            <span>{option.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span>{color.floss}</span>
                                        <span className="pattern-color-name">{color.name}</span>
                                        {showStitchCount && (
                                            <span className="pattern-meta-pill">
                                                {stitchCountLabel}
                                            </span>
                                        )}
                                        {showSkeinEstimate && (
                                            <span className="pattern-meta-pill">
                                                {skeinLabel}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternPage;
