// src/TextEditor.js

import React, { useEffect, useRef, useState, useCallback } from 'react';
import TitleCardPanel from './components/TitleCardPanel';
import TextInputPanel from './components/TextInputPanel';
import CustomizePanel from './components/CustomizePanel';
import HoopPanel from './components/HoopPanel';
import ComponentsPanel from './components/ComponentsPanel';
import { useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill CSS
import './styles/TextEditor.css';

const renderTextToImage = (text, options = {}) => {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (!trimmed) return null;

    const fontSize = Number.isFinite(options.fontSize) ? options.fontSize : 24;
    const fontFamily = options.fontFamily || 'Arial, sans-serif';
    const textColor = options.textColor || '#111111';
    const scale = Number.isFinite(options.scale) ? options.scale : 1;
    const backgroundColor = options.backgroundColor === undefined ? '#ffffff' : options.backgroundColor;
    const letterSpacing = Number.isFinite(options.letterSpacing) ? options.letterSpacing : 0;
    const lineHeight = Math.round(fontSize * 1.3);
    const maxWidth = 360;
    const bendDegrees = Number.isFinite(options.bendDegrees) ? options.bendDegrees : 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.font = `${fontSize}px ${fontFamily}`;

    const measureWithSpacing = (text) => {
        if (!text) return 0;
        const base = ctx.measureText(text).width;
        return base + Math.max(0, text.length - 1) * letterSpacing;
    };

    if (bendDegrees === 0) {
        const words = trimmed.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = measureWithSpacing(testLine);
            if (width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);

        const textWidth = Math.min(
            maxWidth,
            Math.max(...lines.map((line) => measureWithSpacing(line)))
        );
        const textHeight = lines.length * lineHeight;

        const padding = Number.isFinite(options.padding) ? options.padding : 12;
        const pixelRatio = (window.devicePixelRatio || 1) * scale;

        canvas.width = Math.ceil((textWidth + padding * 2) * pixelRatio);
        canvas.height = Math.ceil((textHeight + padding * 2) * pixelRatio);
        canvas.style.width = `${textWidth + padding * 2}px`;
        canvas.style.height = `${textHeight + padding * 2}px`;

        ctx.scale(pixelRatio, pixelRatio);
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, textWidth + padding * 2, textHeight + padding * 2);
        }
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';

        lines.forEach((line, index) => {
            let x = padding;
            const y = padding + index * lineHeight;
            for (const char of line) {
                ctx.fillText(char, x, y);
                x += ctx.measureText(char).width + letterSpacing;
            }
        });

        return canvas.toDataURL('image/png');
    }

    const padding = Number.isFinite(options.padding) ? options.padding : 16;
    const pixelRatio = (window.devicePixelRatio || 1) * scale;
    const totalAngle = (bendDegrees * Math.PI) / 180;
    const charMetrics = Array.from(trimmed).map((char) => ({
        char,
        width: ctx.measureText(char).width,
        advance: ctx.measureText(char).width + letterSpacing
    }));
    const textWidth = charMetrics.reduce((sum, metric) => sum + metric.advance, 0);
    const radius = Math.max(80, Math.abs(textWidth / totalAngle));
    const rise = Math.abs(radius * (1 - Math.cos(totalAngle / 2)));
    const height = padding * 2 + fontSize * 2 + rise;
    const width = padding * 2 + textWidth + fontSize;

    canvas.width = Math.ceil(width * pixelRatio);
    canvas.height = Math.ceil(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(pixelRatio, pixelRatio);
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    const centerX = padding + textWidth / 2;
    const baseY = padding + radius + fontSize / 2;
    let currentAngle = -totalAngle / 2;

    charMetrics.forEach((metric) => {
        const angle = currentAngle + (metric.advance / 2 / textWidth) * totalAngle;
        const x = centerX + radius * Math.sin(angle);
        const y = baseY - radius * Math.cos(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(metric.char, -metric.width / 2, 0);
        ctx.restore();

        currentAngle += (metric.advance / textWidth) * totalAngle;
    });

    return canvas.toDataURL('image/png');
};

const createSvgDataUrl = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const createTutorialSvg = (title, subtitle, layoutSvg) => createSvgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320" viewBox="0 0 560 320">
        <defs>
            <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stop-color="#fdf7f2" />
                <stop offset="100%" stop-color="#e7cfc3" />
            </linearGradient>
        </defs>
        <rect width="560" height="320" rx="24" fill="url(#bg)" />
        <rect x="36" y="40" width="488" height="200" rx="18" fill="#fffdf8" stroke="#e6dbc9" stroke-width="2" />
        ${layoutSvg}
        <text x="70" y="268" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#3b2f2d">${title}</text>
        <text x="70" y="292" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#6e5e59">${subtitle}</text>
    </svg>`
);

const tutorialLayouts = {
    boxBase: `
        <rect x="64" y="70" width="432" height="140" rx="14" fill="#f5efe6" stroke="#e6dbc9" stroke-width="2" />
        <rect x="86" y="78" width="118" height="88" rx="14" fill="#e7cfc3" stroke="#cba0a0" stroke-width="2" />
        <rect x="214" y="78" width="118" height="88" rx="14" fill="#e7cfc3" stroke="#cba0a0" stroke-width="2" />
        <rect x="342" y="78" width="118" height="88" rx="14" fill="#e7cfc3" stroke="#cba0a0" stroke-width="2" />
        <text x="102" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#6e5e59">Type text</text>
        <text x="226" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#6e5e59">Customize Font</text>
        <text x="346" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#6e5e59">Position in Hoop</text>
    `,
    hoopPreview: `
        <circle cx="280" cy="156" r="54" fill="#fffdf8" stroke="#3a312b" stroke-width="4" />
        <circle cx="280" cy="156" r="42" fill="none" stroke="#cba0a0" stroke-width="3" stroke-dasharray="6 6" />
        <rect x="236" y="140" width="88" height="32" rx="6" fill="#e7cfc3" stroke="#b48787" stroke-width="2" />
        <rect x="238" y="142" width="10" height="10" fill="#fffdf8" stroke="#b48787" stroke-width="2" />
        <rect x="312" y="142" width="10" height="10" fill="#fffdf8" stroke="#b48787" stroke-width="2" />
        <rect x="238" y="160" width="10" height="10" fill="#fffdf8" stroke="#b48787" stroke-width="2" />
        <rect x="312" y="160" width="10" height="10" fill="#fffdf8" stroke="#b48787" stroke-width="2" />
    `,
    boxHighlight1: `
        <rect x="86" y="78" width="118" height="88" rx="14" fill="#cba0a0" stroke="#b48787" stroke-width="3" />
        <text x="102" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#3b2f2d">Type text</text>
    `,
    boxHighlight2: `
        <rect x="214" y="78" width="118" height="88" rx="14" fill="#cba0a0" stroke="#b48787" stroke-width="3" />
        <text x="226" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#3b2f2d">Customize Font</text>
    `,
    boxHighlight3: `
        <rect x="342" y="78" width="118" height="88" rx="14" fill="#cba0a0" stroke="#b48787" stroke-width="3" />
        <text x="346" y="98" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#3b2f2d">Position in Hoop</text>
    `,
    patternBox: `
        <rect x="64" y="70" width="432" height="140" rx="14" fill="#f5efe6" stroke="#e6dbc9" stroke-width="2" />
        <rect x="88" y="92" width="200" height="96" rx="8" fill="#fffdf8" stroke="#e6dbc9" stroke-width="2" />
        <g stroke="#c9bfae" stroke-width="1">
            <path d="M108 92V188" />
            <path d="M128 92V188" />
            <path d="M148 92V188" />
            <path d="M168 92V188" />
            <path d="M188 92V188" />
            <path d="M208 92V188" />
        </g>
        <g stroke="#c9bfae" stroke-width="1">
            <path d="M88 112H288" />
            <path d="M88 132H288" />
            <path d="M88 152H288" />
            <path d="M88 172H288" />
        </g>
        <rect x="312" y="92" width="164" height="18" rx="9" fill="#cba0a0" />
        <rect x="312" y="118" width="140" height="12" rx="6" fill="#e7cfc3" />
        <rect x="312" y="140" width="120" height="12" rx="6" fill="#b48787" />
        <rect x="312" y="162" width="100" height="12" rx="6" fill="#e7cfc3" />
    `
};

const premadeComponents = [
    {
        id: 'premade-flower',
        name: 'Blooming Flower',
        width: 140,
        height: 140,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="-6 -6 152 152">
                <rect width="140" height="140" fill="none"/>
                <g fill="#d982a1" stroke="#3a312b" stroke-width="3">
                    <ellipse cx="70" cy="26" rx="18" ry="28"/>
                    <ellipse cx="102" cy="38" rx="18" ry="28" transform="rotate(35 102 38)"/>
                    <ellipse cx="114" cy="72" rx="18" ry="28" transform="rotate(80 114 72)"/>
                    <ellipse cx="102" cy="104" rx="18" ry="28" transform="rotate(125 102 104)"/>
                    <ellipse cx="70" cy="116" rx="18" ry="28"/>
                    <ellipse cx="38" cy="104" rx="18" ry="28" transform="rotate(-125 38 104)"/>
                    <ellipse cx="26" cy="72" rx="18" ry="28" transform="rotate(-80 26 72)"/>
                    <ellipse cx="38" cy="38" rx="18" ry="28" transform="rotate(-35 38 38)"/>
                </g>
                <circle cx="70" cy="72" r="20" fill="#f5d27a" stroke="#3a312b" stroke-width="4"/>
                <circle cx="70" cy="72" r="10" fill="#f2b450"/>
            </svg>`
        )
    },
    {
        id: 'premade-daisy',
        name: 'Daisy Bloom',
        width: 140,
        height: 140,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="-6 -6 152 152">
                <rect width="140" height="140" fill="none"/>
                <g fill="#f5efe6" stroke="#3a312b" stroke-width="3">
                    <ellipse cx="70" cy="20" rx="14" ry="26"/>
                    <ellipse cx="104" cy="32" rx="14" ry="26" transform="rotate(30 104 32)"/>
                    <ellipse cx="120" cy="70" rx="14" ry="26" transform="rotate(80 120 70)"/>
                    <ellipse cx="104" cy="108" rx="14" ry="26" transform="rotate(130 104 108)"/>
                    <ellipse cx="70" cy="120" rx="14" ry="26"/>
                    <ellipse cx="36" cy="108" rx="14" ry="26" transform="rotate(-130 36 108)"/>
                    <ellipse cx="20" cy="70" rx="14" ry="26" transform="rotate(-80 20 70)"/>
                    <ellipse cx="36" cy="32" rx="14" ry="26" transform="rotate(-30 36 32)"/>
                </g>
                <circle cx="70" cy="70" r="18" fill="#f2b450" stroke="#3a312b" stroke-width="4"/>
                <circle cx="70" cy="70" r="8" fill="#f5d27a"/>
            </svg>`
        )
    },
    {
        id: 'premade-rosy-bloom',
        name: 'Rosy Bloom',
        width: 140,
        height: 140,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
                <rect width="140" height="140" fill="none"/>
                <g fill="#d48a9b" stroke="#3a312b" stroke-width="3">
                    <path d="M70 22C60 22 50 30 50 42C50 56 62 64 70 64C78 64 90 56 90 42C90 30 80 22 70 22Z"/>
                    <path d="M34 56C34 42 48 36 60 40C74 44 78 60 70 70C62 80 34 72 34 56Z"/>
                    <path d="M106 56C106 42 92 36 80 40C66 44 62 60 70 70C78 80 106 72 106 56Z"/>
                    <path d="M48 98C48 82 62 76 70 78C78 76 92 82 92 98C92 112 80 120 70 120C60 120 48 112 48 98Z"/>
                </g>
                <circle cx="70" cy="70" r="16" fill="#f5efe6" stroke="#3a312b" stroke-width="3"/>
                <circle cx="70" cy="70" r="6" fill="#f2b450"/>
            </svg>`
        )
    },
    {
        id: 'premade-lotus',
        name: 'Lotus Petals',
        width: 140,
        height: 140,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
                <rect width="140" height="140" fill="none"/>
                <g fill="#e7cfc3" stroke="#3a312b" stroke-width="3">
                    <path d="M70 18C58 30 54 46 70 58C86 46 82 30 70 18Z"/>
                    <path d="M28 62C44 62 56 70 64 84C46 86 32 78 28 62Z"/>
                    <path d="M112 62C96 62 84 70 76 84C94 86 108 78 112 62Z"/>
                    <path d="M44 100C54 94 62 90 70 90C78 90 86 94 96 100C84 114 56 114 44 100Z"/>
                </g>
                <circle cx="70" cy="72" r="12" fill="#f2b450" stroke="#3a312b" stroke-width="3"/>
            </svg>`
        )
    },
    {
        id: 'premade-rose',
        name: 'Single Rose',
        width: 140,
        height: 140,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
                <defs>
                    <linearGradient id="rose" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#e8a1a8"/>
                        <stop offset="1" stop-color="#c46b78"/>
                    </linearGradient>
                </defs>
                <rect width="140" height="140" fill="none"/>
                <path d="M70 24C56 24 46 34 46 48C46 62 58 74 70 78C82 74 94 62 94 48C94 34 84 24 70 24Z" fill="url(#rose)" stroke="#3a312b" stroke-width="3"/>
                <path d="M58 50C60 42 66 38 70 38C74 38 80 42 82 50" fill="none" stroke="#3a312b" stroke-width="2"/>
                <path d="M50 62C50 52 58 50 64 52C72 54 76 62 70 70C64 78 50 72 50 62Z" fill="#d48792" stroke="#3a312b" stroke-width="2"/>
                <path d="M90 62C90 52 82 50 76 52C68 54 64 62 70 70C76 78 90 72 90 62Z" fill="#d48792" stroke="#3a312b" stroke-width="2"/>
                <path d="M70 78C64 86 58 96 56 110" stroke="#3a312b" stroke-width="3" fill="none"/>
                <path d="M70 78C76 86 82 96 84 110" stroke="#3a312b" stroke-width="3" fill="none"/>
                <path d="M52 98C58 92 64 90 70 90C76 90 82 92 88 98" fill="#9fb5a5" stroke="#3a312b" stroke-width="3"/>
            </svg>`
        )
    },
    {
        id: 'premade-tulip',
        name: 'Tulip',
        width: 130,
        height: 140,
        ratio: 130 / 140,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="140" viewBox="0 0 130 140">
                <rect width="130" height="140" fill="none"/>
                <path d="M65 26C52 32 44 44 44 58C44 74 54 88 65 94C76 88 86 74 86 58C86 44 78 32 65 26Z" fill="#d982a1" stroke="#3a312b" stroke-width="3"/>
                <path d="M65 94V120" stroke="#3a312b" stroke-width="3"/>
                <path d="M46 92C52 100 58 104 65 106" fill="none" stroke="#3a312b" stroke-width="3"/>
                <path d="M84 92C78 100 72 104 65 106" fill="none" stroke="#3a312b" stroke-width="3"/>
                <path d="M36 110C48 104 56 104 65 104C74 104 82 104 94 110" fill="#9fb5a5" stroke="#3a312b" stroke-width="3"/>
            </svg>`
        )
    },
    {
        id: 'premade-mushroom',
        name: 'Mushroom',
        width: 140,
        height: 120,
        ratio: 140 / 120,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="120" viewBox="0 0 140 120">
                <rect width="140" height="120" fill="none"/>
                <path d="M24 60C28 34 52 20 70 20C88 20 112 34 116 60Z" fill="#d982a1" stroke="#3a312b" stroke-width="3"/>
                <path d="M52 60C54 82 56 98 70 104C84 98 86 82 88 60Z" fill="#f5efe6" stroke="#3a312b" stroke-width="3"/>
                <circle cx="52" cy="44" r="6" fill="#f5efe6" opacity="0.85"/>
                <circle cx="70" cy="36" r="6" fill="#f5efe6" opacity="0.85"/>
                <circle cx="88" cy="46" r="6" fill="#f5efe6" opacity="0.85"/>
            </svg>`
        )
    },
    {
        id: 'premade-snowflake',
        name: 'Snowflake',
        width: 120,
        height: 120,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="none"/>
                <g stroke="#3a312b" stroke-width="4" stroke-linecap="round">
                    <path d="M60 12V108"/>
                    <path d="M12 60H108"/>
                    <path d="M24 24L96 96"/>
                    <path d="M96 24L24 96"/>
                    <path d="M60 12L54 22"/>
                    <path d="M60 12L66 22"/>
                    <path d="M60 108L54 98"/>
                    <path d="M60 108L66 98"/>
                    <path d="M12 60L22 54"/>
                    <path d="M12 60L22 66"/>
                    <path d="M108 60L98 54"/>
                    <path d="M108 60L98 66"/>
                </g>
            </svg>`
        )
    },
    {
        id: 'premade-songbird',
        name: 'Songbird',
        width: 150,
        height: 120,
        ratio: 150 / 120,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="120" viewBox="0 0 150 120">
                <defs>
                    <linearGradient id="bird" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#a8b7c9"/>
                        <stop offset="1" stop-color="#7e8ea3"/>
                    </linearGradient>
                </defs>
                <rect width="150" height="120" fill="none"/>
                <path d="M24 76C36 56 64 50 84 54C108 58 124 72 120 88C118 98 106 104 90 104C64 104 42 94 24 76Z" fill="url(#bird)" stroke="#3a312b" stroke-width="3"/>
                <path d="M66 58C78 58 90 62 102 70C90 74 80 78 66 78C58 78 48 74 42 68C48 62 56 58 66 58Z" fill="#f5efe6" opacity="0.8"/>
                <circle cx="92" cy="70" r="4" fill="#3a312b"/>
                <path d="M104 72L120 66L110 80Z" fill="#d9a25f" stroke="#3a312b" stroke-width="2"/>
                <path d="M54 86C60 96 66 104 72 110" stroke="#3a312b" stroke-width="3"/>
                <path d="M72 82C78 92 84 100 90 106" stroke="#3a312b" stroke-width="3"/>
            </svg>`
        )
    },
    {
        id: 'premade-diamond',
        name: 'Diamond Star',
        width: 120,
        height: 120,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="none"/>
                <polygon points="60,12 108,60 60,108 12,60" fill="#3a312b"/>
                <polygon points="60,32 88,60 60,88 32,60" fill="#f5efe6" stroke="#3a312b" stroke-width="4"/>
            </svg>`
        )
    },
    {
        id: 'premade-heart',
        name: 'Sweet Heart',
        width: 120,
        height: 110,
        ratio: 120 / 110,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="110" viewBox="0 0 120 110">
                <rect width="120" height="110" fill="none"/>
                <path d="M60 98C24 72 12 54 12 36C12 22 23 12 36 12C46 12 54 18 60 26C66 18 74 12 84 12C97 12 108 22 108 36C108 54 96 72 60 98Z" fill="#d982a1" stroke="#3a312b" stroke-width="4"/>
                <circle cx="40" cy="34" r="6" fill="#f5efe6" opacity="0.6"/>
                <circle cx="80" cy="34" r="6" fill="#f5efe6" opacity="0.6"/>
            </svg>`
        )
    },
    {
        id: 'premade-leaf',
        name: 'Sage Leaf',
        width: 140,
        height: 90,
        ratio: 140 / 90,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="90" viewBox="0 0 140 90">
                <rect width="140" height="90" fill="none"/>
                <path d="M12 52C24 18 64 6 104 18C122 24 130 36 128 52C124 72 98 84 66 80C40 76 22 66 12 52Z" fill="#9fb5a5" stroke="#3a312b" stroke-width="4"/>
                <path d="M24 56C48 52 76 44 116 28" stroke="#3a312b" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M50 58C62 52 78 46 98 34" stroke="#3a312b" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>`
        )
    },
    {
        id: 'premade-bow',
        name: 'Ribbon Bow',
        width: 130,
        height: 90,
        ratio: 130 / 90,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="90" viewBox="0 0 130 90">
                <rect width="130" height="90" fill="none"/>
                <path d="M20 24C44 20 58 30 64 44C50 52 30 58 14 54C6 52 4 34 20 24Z" fill="#cba0a0" stroke="#3a312b" stroke-width="3"/>
                <path d="M110 24C86 20 72 30 66 44C80 52 100 58 116 54C124 52 126 34 110 24Z" fill="#cba0a0" stroke="#3a312b" stroke-width="3"/>
                <circle cx="65" cy="48" r="10" fill="#f5efe6" stroke="#3a312b" stroke-width="3"/>
                <path d="M62 58C58 70 52 80 40 84" stroke="#3a312b" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M68 58C72 70 78 80 90 84" stroke="#3a312b" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>`
        )
    },
    {
        id: 'premade-starburst',
        name: 'Starburst',
        width: 120,
        height: 120,
        ratio: 1,
        src: createSvgDataUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                <rect width="120" height="120" fill="none"/>
                <g fill="#f2b450" stroke="#3a312b" stroke-width="3">
                    <polygon points="60,8 68,40 102,30 78,54 110,60 78,66 102,90 68,80 60,112 52,80 18,90 42,66 10,60 42,54 18,30 52,40"/>
                </g>
                <circle cx="60" cy="60" r="10" fill="#f5efe6" stroke="#3a312b" stroke-width="3"/>
            </svg>`
        )
    }
];

const tutorialSteps = [
    {
        title: 'Step 1: Type your text',
        description: 'Enter text in Box 1, then click “Customize Font”.',
        image: createTutorialSvg(
            'Type your text',
            'Customize Font to continue',
            `${tutorialLayouts.boxBase}${tutorialLayouts.boxHighlight1}`
        )
    },
    {
        title: 'Step 2: Customize the style',
        description: 'Pick fonts, colors, spacing, and bend. Then add it to the hoop.',
        image: createTutorialSvg(
            'Customize your design',
            'Adjust font, color, and bend',
            `${tutorialLayouts.boxBase}${tutorialLayouts.boxHighlight2}`
        )
    },
    {
        title: 'Step 3: Position in the hoop',
        description: 'Drag and resize items to fit the hoop.',
        image: createTutorialSvg(
            'Position in hoop',
            'Drag to move, resize with corners',
            `${tutorialLayouts.boxBase}${tutorialLayouts.boxHighlight3}`
        )
    },
    {
        title: 'Step 4: Make your pattern',
        description: 'Click “Make Cross Stitch Pattern” to generate the chart.',
        image: createTutorialSvg('Generate your pattern', 'Export your final cross stitch', tutorialLayouts.patternBox)
    }
];

const TextEditor = () => {
    const componentsPageSize = 8;
    const [previewImage, setPreviewImage] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [previewSourceId, setPreviewSourceId] = useState(null);
    const [previewBend, setPreviewBend] = useState(0);
    const [previewFontSize, setPreviewFontSize] = useState(32);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [previewBackground, setPreviewBackground] = useState('theme');
    const [hoopShape, setHoopShape] = useState('circle');
    const [hoopSize, setHoopSize] = useState('6');
    const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
    const [textColor, setTextColor] = useState('#111111');
    const [hoopImages, setHoopImages] = useState([]);
    const [selectedHoopId, setSelectedHoopId] = useState(null);
    const [components, setComponents] = useState([]);
    const [componentsView, setComponentsView] = useState('custom');
    const [componentsPage, setComponentsPage] = useState(1);
    const [premadePage, setPremadePage] = useState(1);
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [clearHoopOpen, setClearHoopOpen] = useState(false);
    const [clearHoopPos, setClearHoopPos] = useState({ left: 0, top: 0 });
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [activeThemeId, setActiveThemeId] = useState('heirloom');
    const [activePanel, setActivePanel] = useState('text');
    const quillRef = useRef(null);
    const quillInstance = useRef(null); // Use a ref to hold the Quill instance
    const circleRef = useRef(null);
    const themeRef = useRef(null);
    const hoopActionsRef = useRef(null);
    const clearHoopButtonRef = useRef(null);
    const hoopDragRef = useRef({ id: null, startX: 0, startY: 0, originX: 0, originY: 0 });
    const hoopResizeRef = useRef({ id: null, startX: 0, startWidth: 0, ratio: 1, dirX: 1 });
    const navigate = useNavigate();

    useEffect(() => {
        if (componentsView === 'custom') {
            setComponentsPage(1);
        } else {
            setPremadePage(1);
        }
    }, [componentsView]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(components.length / componentsPageSize));
        setComponentsPage((prev) => Math.min(prev, totalPages));
    }, [components.length, componentsPageSize]);

    const themeOptions = [
        {
            id: 'heirloom',
            name: 'Heirloom Linen',
            palette: {
                cream: '#fdfaf5',
                linen: '#f5efe6',
                latte: '#e6dbc9',
                sage: '#c9bfae',
                sageDark: '#a99684',
                ink: '#3a312b',
                inkSoft: '#6f6257',
                card: '#fffdf8'
            }
        },
        {
            id: 'sage',
            name: 'Garden Sage',
            palette: {
                cream: '#f3efe6',
                linen: '#e7e0d3',
                latte: '#d2c7b5',
                sage: '#93a98e',
                sageDark: '#6d8571',
                ink: '#2f2c2a',
                inkSoft: '#5e5a55',
                card: '#fffdf7'
            }
        },
        {
            id: 'rose',
            name: 'Rose Tea',
            palette: {
                cream: '#fdf7f2',
                linen: '#f2e4dc',
                latte: '#e7cfc3',
                sage: '#cba0a0',
                sageDark: '#b48787',
                ink: '#3b2f2d',
                inkSoft: '#6e5e59',
                card: '#fffaf4'
            }
        },
        {
            id: 'bluebird',
            name: 'Bluebird Sky',
            palette: {
                cream: '#f1f6ff',
                linen: '#d9e8ff',
                latte: '#b9d3f5',
                sage: '#6ea5de',
                sageDark: '#3f78b8',
                ink: '#1e2b3b',
                inkSoft: '#4a637d',
                card: '#f6f9ff'
            }
        },
        {
            id: 'marigold',
            name: 'Marigold Morning',
            palette: {
                cream: '#fff7ea',
                linen: '#f3e6cf',
                latte: '#e0cdb1',
                sage: '#d1a255',
                sageDark: '#b3833c',
                ink: '#3f2f22',
                inkSoft: '#6d5847',
                card: '#fffaf3'
            }
        },
        {
            id: 'cottage',
            name: 'Cottage Meadow',
            palette: {
                cream: '#101613',
                linen: '#151e19',
                latte: '#1d2a23',
                sage: '#2f4b3a',
                sageDark: '#16261d',
                ink: '#f2f5f3',
                inkSoft: '#c9d2cc',
                card: '#1a241f'
            }
        },
        {
            id: 'lavender',
            name: 'Lavender Haze',
            palette: {
                cream: '#f9f6fb',
                linen: '#eee6f1',
                latte: '#d8cce2',
                sage: '#b59ad0',
                sageDark: '#8c6baa',
                ink: '#352a3b',
                inkSoft: '#64526f',
                card: '#fffaff'
            }
        }
    ];

    const activeTheme = themeOptions.find((theme) => theme.id === activeThemeId) || themeOptions[0];
    const themeStyle = activeTheme
        ? {
            '--cream': activeTheme.palette.cream,
            '--linen': activeTheme.palette.linen,
            '--latte': activeTheme.palette.latte,
            '--sage': activeTheme.palette.sage,
            '--sage-dark': activeTheme.palette.sageDark,
            '--ink': activeTheme.palette.ink,
            '--ink-soft': activeTheme.palette.inkSoft,
            '--card': activeTheme.palette.card,
            '--border': activeTheme.palette.latte
        }
        : undefined;

    const themeSwatches = (theme) => [
        theme.palette.cream,
        theme.palette.linen,
        theme.palette.latte,
        theme.palette.sage,
        theme.palette.sageDark,
        theme.palette.ink,
        theme.palette.inkSoft,
        theme.palette.card
    ];

    useEffect(() => {
        if (!activeTheme) return;
        sessionStorage.setItem('stitchuation-theme', JSON.stringify(activeTheme.palette));
    }, [activeTheme]);


    const getThemePreviewBackground = useCallback(() => {
        if (previewBackground === 'white') return '#ffffff';
        if (!themeRef.current) return '#ffffff';
        const styles = getComputedStyle(themeRef.current);
        const linen = styles.getPropertyValue('--linen').trim();
        const card = styles.getPropertyValue('--card').trim();
        return linen || card || '#ffffff';
    }, [previewBackground]);

    const clampHoopOffset = (nextX, nextY, width, height) => {
        if (!circleRef.current) {
            return { x: nextX, y: nextY };
        }

        const frameRect = circleRef.current.getBoundingClientRect();
        const halfFrameW = frameRect.width / 2;
        const halfFrameH = frameRect.height / 2;
        const halfW = (width || 0) / 2;
        const halfH = (height || width || 0) / 2;
        const maxX = Math.max(0, halfFrameW - halfW);
        const maxY = Math.max(0, halfFrameH - halfH);

        return {
            x: Math.max(-maxX, Math.min(maxX, nextX)),
            y: Math.max(-maxY, Math.min(maxY, nextY))
        };
    };

    const handleHoopPointerDown = (id) => (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const image = hoopImages.find((item) => item.id === id);
        if (!image) return;
        hoopDragRef.current = {
            id,
            startX: event.clientX,
            startY: event.clientY,
            originX: image.x,
            originY: image.y
        };
    };

    const handleHoopPointerMove = (event) => {
        if (!hoopDragRef.current.id) return;
        const deltaX = event.clientX - hoopDragRef.current.startX;
        const deltaY = event.clientY - hoopDragRef.current.startY;
        const nextX = hoopDragRef.current.originX + deltaX;
        const nextY = hoopDragRef.current.originY + deltaY;

        setHoopImages((prev) =>
            prev.map((item) => {
                if (item.id !== hoopDragRef.current.id) return item;
                const clamped = clampHoopOffset(nextX, nextY, item.width, item.height);
                return { ...item, x: clamped.x, y: clamped.y };
            })
        );
    };

    const handleHoopPointerUp = (event) => {
        if (!hoopDragRef.current.id) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        hoopDragRef.current.id = null;
    };

    const handleResizePointerDown = (id, dirX) => (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const image = hoopImages.find((item) => item.id === id);
        if (!image) return;
        hoopResizeRef.current = {
            id,
            startX: event.clientX,
            startWidth: image.width,
            ratio: image.ratio || (image.height && image.width ? image.height / image.width : 1),
            dirX
        };
    };

    const handleResizePointerMove = (event) => {
        if (!hoopResizeRef.current.id) return;
        const deltaX = event.clientX - hoopResizeRef.current.startX;
        const nextWidth = Math.max(40, hoopResizeRef.current.startWidth + deltaX * hoopResizeRef.current.dirX);
        setHoopImages((prev) =>
            prev.map((item) => {
                if (item.id !== hoopResizeRef.current.id) return item;
                return { ...item, width: nextWidth, height: nextWidth * hoopResizeRef.current.ratio };
            })
        );
    };

    const handleResizePointerUp = (event) => {
        if (!hoopResizeRef.current.id) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        hoopResizeRef.current.id = null;
    };

    const hoopPixelMapCircle = {
        4: 150,
        5: 180,
        6: 210,
        7: 240,
        8: 270,
        10: 290,
        12: 300
    };

    const hoopPixelMapOval = {
        '5x7': { width: 160, height: 220 },
        '8x10': { width: 210, height: 280 },
        '9x12': { width: 230, height: 300 }
    };

    const hoopPixelMapSquare = {
        4: 150,
        5: 180,
        6: 210,
        7: 240,
        8: 270,
        10: 290,
        12: 300
    };

    const hoopPixelMapRectangle = {
        '6x8': { width: 210, height: 250 },
        '8x10': { width: 240, height: 290 },
        '9x12': { width: 260, height: 320 }
    };

    const circleSizes = Object.keys(hoopPixelMapCircle).map((size) => ({
        label: `${size} in`,
        value: size
    }));

    const ovalSizes = Object.keys(hoopPixelMapOval).map((size) => ({
        label: `${size.replace('x', ' x ')} in`,
        value: size
    }));

    const squareSizes = Object.keys(hoopPixelMapSquare).map((size) => ({
        label: `${size} in`,
        value: size
    }));

    const rectangleSizes = Object.keys(hoopPixelMapRectangle).map((size) => ({
        label: `${size.replace('x', ' x ')} in`,
        value: size
    }));

    const getHoopDimensions = () => {
        if (hoopShape === 'oval') {
            const dims = hoopPixelMapOval[hoopSize] || hoopPixelMapOval['5x7'];
            return { width: dims.width, height: dims.height };
        }
        if (hoopShape === 'rectangle') {
            const dims = hoopPixelMapRectangle[hoopSize] || hoopPixelMapRectangle['6x8'];
            return { width: dims.width, height: dims.height };
        }
        if (hoopShape === 'square') {
            const size = Number(hoopSize);
            const side = hoopPixelMapSquare[size] || hoopPixelMapSquare[6];
            return { width: side, height: side };
        }
        const size = Number(hoopSize);
        const diameter = hoopPixelMapCircle[size] || hoopPixelMapCircle[6];
        return { width: diameter, height: diameter };
    };

    const getHoopSizeInches = () => {
        if ((hoopShape === 'oval' || hoopShape === 'rectangle') && typeof hoopSize === 'string' && hoopSize.includes('x')) {
            const [w, h] = hoopSize.split('x').map((value) => Number(value.trim()));
            if (Number.isFinite(w) && Number.isFinite(h)) {
                return Math.max(w, h);
            }
        }
        return Number(hoopSize) || 6;
    };

    const getHoopItemLimit = () => (getHoopSizeInches() >= 12 ? 15 : 10);

    const canAddHoopItem = (currentCount) => {
        const limit = getHoopItemLimit();
        if (currentCount >= limit) {
            const sizeLabel = getHoopSizeInches();
            window.alert(`Maximum of ${limit} items for a ${sizeLabel}" hoop.`);
            return false;
        }
        return true;
    };

    const { width: hoopWidth, height: hoopHeight } = getHoopDimensions();
    const maxHoopSize = Math.max(hoopWidth, hoopHeight);

    const handlePreviewBend = (delta) => {
        setPreviewBend((prev) => Math.max(0, Math.min(80, prev + delta)));
    };

    const handleTextImageClick = () => {
        if (!quillInstance.current) return;
        const range = quillInstance.current.getSelection();
        const selectedText = range && range.length > 0
            ? quillInstance.current.getText(range.index, range.length)
            : quillInstance.current.getText().trim();
        if (!selectedText) return;
        setPreviewText(selectedText);
        setPreviewSourceId(null);
        setPreviewFontSize(32);
        setPreviewBend(0);
        setLetterSpacing(0);
        quillInstance.current.setText('');
        setActivePanel('customize');
    };

    const resetCustomizeControls = () => {
        setFontFamily('Arial, sans-serif');
        setTextColor('#111111');
        setPreviewFontSize(32);
        setPreviewBend(0);
        setLetterSpacing(0);
    };

    const addToHoop = () => {
        if (!previewText) return;
        if (!canAddHoopItem(hoopImages.length)) return;
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const width = Math.max(120, previewFontSize * 5);
        const transparentImage = renderTextToImage(previewText, {
            bendDegrees: previewBend,
            fontSize: previewFontSize,
            fontFamily,
            textColor,
            scale: 2,
            letterSpacing,
            backgroundColor: null,
            padding: 6
        });
        if (!transparentImage) return;
        const image = new Image();
        image.onload = () => {
            const height = image.height * (width / image.width);
            const ratio = image.height / image.width;
            setHoopImages((prev) => {
                if (!canAddHoopItem(prev.length)) {
                    return prev;
                }
                return [
                    ...prev,
                    { id, src: transparentImage, x: 0, y: 0, width, height, ratio }
                ];
            });
            if (!previewSourceId) {
                setComponents((prev) => [
                    ...prev,
                    {
                        id,
                        src: transparentImage,
                        text: previewText,
                        width,
                        height,
                        ratio,
                        fontFamily,
                        fontSize: previewFontSize,
                        textColor,
                        bend: previewBend,
                        letterSpacing
                    }
                ]);
            }
            setSelectedHoopId(id);
            setPreviewText('');
            setPreviewImage('');
            setPreviewSourceId(null);
            setPreviewBend(0);
            setPreviewFontSize(32);
            if (quillInstance.current) {
                quillInstance.current.setText('');
            }
            setActivePanel('hoop');
        };
        image.src = transparentImage;
    };

    const addComponentToHoop = (component) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setHoopImages((prev) => {
            if (!canAddHoopItem(prev.length)) {
                return prev;
            }
            return [
                ...prev,
                {
                    id,
                    src: component.src,
                    x: 0,
                    y: 0,
                    width: component.width,
                    height: component.height,
                    ratio: component.ratio
                }
            ];
        });
        setSelectedHoopId(id);
        setActivePanel('hoop');
    };

    const restoreComponentToBox1 = (component) => {
        if (quillInstance.current) {
            quillInstance.current.setText(component.text || '');
        }
        setPreviewText('');
        setPreviewImage('');
        setPreviewBend(0);
        setPreviewFontSize(32);
        setLetterSpacing(0);
        setActivePanel('text');
    };

    const restoreComponentToBox2 = (component) => {
        if (quillInstance.current) {
            quillInstance.current.setText('');
        }
        setFontFamily(component.fontFamily || fontFamily);
        setTextColor(component.textColor || textColor);
        setPreviewFontSize(component.fontSize || 32);
        setPreviewBend(component.bend ?? 0);
        setLetterSpacing(component.letterSpacing ?? 0);
        setPreviewText(component.text || '');
        setPreviewSourceId(component.id);
        setActivePanel('customize');
    };

    const restoreComponentToBox3 = (component) => {
        if (quillInstance.current) {
            quillInstance.current.setText('');
        }
        setPreviewText('');
        setPreviewImage('');
        setPreviewSourceId(null);
        setPreviewBend(0);
        setPreviewFontSize(32);
        setLetterSpacing(0);
        addComponentToHoop(component);
        setActivePanel('hoop');
    };

    const deleteComponent = (id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));
        setHoopImages((prev) => prev.filter((item) => item.id !== id));
        if (selectedHoopId === id) {
            setSelectedHoopId(null);
        }
        if (previewSourceId === id) {
            setPreviewText('');
            setPreviewImage('');
            setPreviewSourceId(null);
            setPreviewBend(0);
            setPreviewFontSize(32);
        }
    };

    const clearTextBox = () => {
        if (quillInstance.current) {
            quillInstance.current.setText('');
        }
        setActivePanel('text');
    };

    const clearPreviewBox = () => {
        setPreviewText('');
        setPreviewImage('');
        setPreviewSourceId(null);
        setPreviewBend(0);
        setPreviewFontSize(32);
        setActivePanel('text');
    };

    const deleteSelectedHoopItem = () => {
        if (!selectedHoopId) return;
        setHoopImages((prev) => prev.filter((item) => item.id !== selectedHoopId));
        setSelectedHoopId(null);
    };

    const clearHoop = () => {
        if (hoopImages.length === 0) return;
        const rowRect = hoopActionsRef.current?.getBoundingClientRect();
        const buttonRect = clearHoopButtonRef.current?.getBoundingClientRect();
        if (rowRect && buttonRect) {
            setClearHoopPos({
                left: buttonRect.left - rowRect.left + buttonRect.width / 2,
                top: buttonRect.top - rowRect.top
            });
        }
        setClearHoopOpen(true);
    };

    const confirmClearHoop = () => {
        setHoopImages([]);
        setSelectedHoopId(null);
        setClearHoopOpen(false);
    };


    const exportCircleImage = async () => {
        const circleNode = circleRef.current;
        if (!circleNode) return null;

        const circleSize = circleNode.getBoundingClientRect().width;
        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = Math.round(circleSize);
        baseCanvas.height = Math.round(circleSize);
        const ctx = baseCanvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(baseCanvas.width / 2, baseCanvas.height / 2, baseCanvas.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const imagesToRender = hoopImages.length
            ? hoopImages
            : previewImage
                ? [{ id: 'preview', src: previewImage, x: 0, y: 0, width: baseCanvas.width * 0.85 }]
                : [];

        if (!imagesToRender.length) {
            ctx.restore();
            return baseCanvas.toDataURL('image/png');
        }

        const loaded = await Promise.all(
            imagesToRender.map(
                (item) =>
                    new Promise((resolve) => {
                        const image = new Image();
                        image.onload = () => resolve({ image, item });
                        image.onerror = () => resolve(null);
                        image.src = item.src;
                    })
            )
        );

        loaded
            .filter(Boolean)
            .forEach(({ image, item }) => {
                const width = item.width || baseCanvas.width * 0.85;
                const height = item.height || (image.height * (width / image.width));
                const centerX = baseCanvas.width / 2 + (item.x || 0);
                const centerY = baseCanvas.height / 2 + (item.y || 0);
                const drawX = centerX - width / 2;
                const drawY = centerY - height / 2;
                ctx.drawImage(image, drawX, drawY, width, height);
            });
        ctx.restore();

        return baseCanvas.toDataURL('image/png');
    };

    const handleMakePattern = async () => {
        const circleImage = await exportCircleImage();
        if (!circleImage) return;
        navigate('/pattern', {
            state: {
                circleImage,
                textColor,
                previewBackground,
                themePalette: activeTheme?.palette || null
            }
        });
    };

    useEffect(() => {
        const quillNode = quillRef.current;
        if (!quillNode || quillInstance.current) {
            return undefined;
        }

        // Clear any leftover editor content (StrictMode mounts twice in dev)
        quillNode.innerHTML = '';

        console.log("TextEditor mounted");

        quillInstance.current = new Quill(quillNode, {
            theme: 'snow',
            modules: {
                toolbar: false
            }
        });

        // Cleanup function to destroy Quill instance
        return () => {
            if (quillInstance.current) {
                quillInstance.current.disable(); // Disable the editor
                quillInstance.current = null; // Nullify the instance reference
            }
            if (quillNode) {
                quillNode.innerHTML = '';
            }
            console.log("TextEditor unmounted");
        };
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('stitchuation-hoop-state');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.hoopImages)) {
                setHoopImages(parsed.hoopImages);
            }
            if (parsed.hoopShape) {
                setHoopShape(parsed.hoopShape);
            }
            if (parsed.hoopSize) {
                setHoopSize(String(parsed.hoopSize));
            }
            if (parsed.selectedHoopId) {
                setSelectedHoopId(parsed.selectedHoopId);
            }
        } catch (error) {
            // ignore invalid stored state
        }
    }, []);

    useEffect(() => {
        const state = {
            hoopImages,
            hoopShape,
            hoopSize,
            selectedHoopId
        };
        sessionStorage.setItem('stitchuation-hoop-state', JSON.stringify(state));
    }, [hoopImages, hoopShape, hoopSize, selectedHoopId]);

    useEffect(() => {
        if (!previewText) {
            setPreviewImage('');
            return;
        }

        const dataUrl = renderTextToImage(previewText, {
            bendDegrees: previewBend,
            fontSize: previewFontSize,
            fontFamily,
            textColor,
            scale: 2,
            letterSpacing,
            backgroundColor: getThemePreviewBackground(),
            padding: 6
        });
        if (!dataUrl) return;
        setPreviewImage(dataUrl);
    }, [previewText, previewBend, previewFontSize, fontFamily, textColor, letterSpacing, activeThemeId, getThemePreviewBackground]);

    useEffect(() => {
        if (!quillInstance.current) return;
        const shouldDisable = Boolean(previewImage);
        if (shouldDisable) {
            quillInstance.current.disable();
        } else {
            quillInstance.current.enable();
        }
    }, [previewImage, activePanel]);

    useEffect(() => {
        if (!circleRef.current) return;

        setHoopImages((prev) => {
            if (prev.length === 0) return prev;

            const frameRect = circleRef.current.getBoundingClientRect();
            const maxWidth = frameRect.width * 0.9;
            const maxHeight = frameRect.height * 0.9;

            let centerX = 0;
            let centerY = 0;

            if (prev.length === 1) {
                centerX = prev[0].x;
                centerY = prev[0].y;
            } else {
                const bounds = prev.reduce(
                    (acc, item) => {
                        const left = item.x - item.width / 2;
                        const right = item.x + item.width / 2;
                        const top = item.y - item.height / 2;
                        const bottom = item.y + item.height / 2;
                        return {
                            minX: Math.min(acc.minX, left),
                            maxX: Math.max(acc.maxX, right),
                            minY: Math.min(acc.minY, top),
                            maxY: Math.max(acc.maxY, bottom)
                        };
                    },
                    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
                );

                centerX = (bounds.minX + bounds.maxX) / 2;
                centerY = (bounds.minY + bounds.maxY) / 2;
            }

            return prev.map((item) => {
                let width = item.width;
                let height = item.height;
                const scale = Math.min(1, maxWidth / width, maxHeight / height);

                if (scale < 1) {
                    width *= scale;
                    height *= scale;
                }

                const shiftedX = item.x - centerX;
                const shiftedY = item.y - centerY;
                const clamped = clampHoopOffset(shiftedX, shiftedY, width, height);

                return {
                    ...item,
                    x: clamped.x,
                    y: clamped.y,
                    width,
                    height,
                    ratio: height / width
                };
            });
        });
    }, [hoopShape, hoopSize]);

    return (
        <div className="editor-theme" style={themeStyle} ref={themeRef}>
            <div className="editor-page">
                <button
                    type="button"
                    className="page-color-button"
                    onClick={() => setThemeModalOpen(true)}
                    aria-label="Open color themes"
                />
                <div className="left-stack">
                    <TitleCardPanel
                        setActivePanel={setActivePanel}
                        setTutorialOpen={setTutorialOpen}
                        setTutorialStepIndex={setTutorialStepIndex}
                    />
                    <TextInputPanel
                        activePanel={activePanel}
                        previewImage={previewImage}
                        setActivePanel={setActivePanel}
                        handleTextImageClick={handleTextImageClick}
                        clearTextBox={clearTextBox}
                        quillRef={quillRef}
                    />
                    <CustomizePanel
                        activePanel={activePanel}
                        previewImage={previewImage}
                        previewText={previewText}
                        setActivePanel={setActivePanel}
                        fontFamily={fontFamily}
                        setFontFamily={setFontFamily}
                        textColor={textColor}
                        setTextColor={setTextColor}
                        previewBend={previewBend}
                        handlePreviewBend={handlePreviewBend}
                        previewBackground={previewBackground}
                        setPreviewBackground={setPreviewBackground}
                        letterSpacing={letterSpacing}
                        setLetterSpacing={setLetterSpacing}
                        previewImageSrc={previewImage}
                        addToHoop={addToHoop}
                        resetCustomizeControls={resetCustomizeControls}
                        clearPreviewBox={clearPreviewBox}
                    />
                </div>
                <HoopPanel
                    activePanel={activePanel}
                    hoopImages={hoopImages}
                    setActivePanel={setActivePanel}
                    hoopShape={hoopShape}
                    setHoopShape={setHoopShape}
                    hoopSize={hoopSize}
                    setHoopSize={setHoopSize}
                    circleSizes={circleSizes}
                    ovalSizes={ovalSizes}
                    squareSizes={squareSizes}
                    rectangleSizes={rectangleSizes}
                    maxHoopSize={maxHoopSize}
                    hoopWidth={hoopWidth}
                    hoopHeight={hoopHeight}
                    circleRef={circleRef}
                    selectedHoopId={selectedHoopId}
                    setSelectedHoopId={setSelectedHoopId}
                    handleHoopPointerDown={handleHoopPointerDown}
                    handleHoopPointerMove={handleHoopPointerMove}
                    handleHoopPointerUp={handleHoopPointerUp}
                    handleResizePointerDown={handleResizePointerDown}
                    handleResizePointerMove={handleResizePointerMove}
                    handleResizePointerUp={handleResizePointerUp}
                    handleMakePattern={handleMakePattern}
                    deleteSelectedHoopItem={deleteSelectedHoopItem}
                    clearHoop={clearHoop}
                    clearHoopOpen={clearHoopOpen}
                    setClearHoopOpen={setClearHoopOpen}
                    clearHoopPos={clearHoopPos}
                    hoopActionsRef={hoopActionsRef}
                    clearHoopButtonRef={clearHoopButtonRef}
                    confirmClearHoop={confirmClearHoop}
                />
                <ComponentsPanel
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    componentsView={componentsView}
                    setComponentsView={setComponentsView}
                    components={components}
                    premadeComponents={premadeComponents}
                    componentsPage={componentsPage}
                    setComponentsPage={setComponentsPage}
                    premadePage={premadePage}
                    setPremadePage={setPremadePage}
                    pageSize={componentsPageSize}
                    restoreComponentToBox1={restoreComponentToBox1}
                    restoreComponentToBox2={restoreComponentToBox2}
                    restoreComponentToBox3={restoreComponentToBox3}
                    deleteComponent={deleteComponent}
                    addComponentToHoop={addComponentToHoop}
                />
            </div>
            {themeModalOpen && (
                <div className="theme-modal" onClick={() => setThemeModalOpen(false)}>
                    <div className="theme-dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="theme-header">
                            <h3>Choose a color theme</h3>
                            <button type="button" className="theme-close" onClick={() => setThemeModalOpen(false)}>
                                ×
                            </button>
                        </div>
                        <div className="theme-grid">
                            {themeOptions.map((theme) => (
                                <div
                                    key={theme.id}
                                    className={`theme-card ${activeThemeId === theme.id ? 'theme-card-active' : ''}`}
                                    onClick={() => {
                                        setActiveThemeId(theme.id);
                                        setThemeModalOpen(false);
                                    }}
                                >
                                    <div className="theme-name">{theme.name}</div>
                                    <div className="theme-swatches">
                                        {themeSwatches(theme).map((color) => (
                                            <span key={color} className="theme-swatch" style={{ background: color }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {tutorialOpen && (
                <div className="tutorial-modal" onClick={() => setTutorialOpen(false)}>
                    <div className="tutorial-dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="tutorial-header">
                            <h3>Stitch-Uation</h3>
                            <button type="button" className="tutorial-close" onClick={() => setTutorialOpen(false)}>
                                ×
                            </button>
                        </div>
                        <div className="tutorial-body">
                            <img
                                src={tutorialSteps[tutorialStepIndex].image}
                                alt={tutorialSteps[tutorialStepIndex].title}
                                className="tutorial-image"
                            />
                            <div className="tutorial-copy">
                                <h4>{tutorialSteps[tutorialStepIndex].title}</h4>
                                <p>{tutorialSteps[tutorialStepIndex].description}</p>
                            </div>
                        </div>
                        <div className="tutorial-footer">
                            <span className="tutorial-progress">
                                Step {tutorialStepIndex + 1} of {tutorialSteps.length}
                            </span>
                            <div className="tutorial-actions">
                                <button
                                    type="button"
                                    className="btn"
                                    disabled={tutorialStepIndex === 0}
                                    onClick={() => setTutorialStepIndex((prev) => Math.max(0, prev - 1))}
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (tutorialStepIndex === tutorialSteps.length - 1) {
                                            setTutorialOpen(false);
                                            return;
                                        }
                                        setTutorialStepIndex((prev) => Math.min(tutorialSteps.length - 1, prev + 1));
                                    }}
                                >
                                    {tutorialStepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextEditor;
