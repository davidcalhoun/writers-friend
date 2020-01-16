import React, { useState, useEffect } from "react";

export const debounce = (func, wait, immediate) => {
	let timeout;
	return (...args) => {
		return new Promise((resolve, reject) => {
			const context = this;
			const later = function() {
				timeout = null;
				if (!immediate) {
					resolve(func.apply(context, args));
				}
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				resolve(func.apply(context, args));
			}
		});
	};
};

export const useUpdateTime = (intervalMS = 1000) => {
	const [time, setTime] = useState(Date.now());

	function update() {
		setTime(Date.now());
	}

	function init() {
		const interval = setInterval(update, intervalMS);

		return () => {
			clearInterval(interval);
		};
	}
	useEffect(init, []);

	return [time, setTime];
};

export const parseJSON = rawText => {
	let parsed = null;
	try {
		parsed = JSON.parse(rawText);
	} catch (e) {
		console.error(e);
	}

	return parsed;
};

export const getLS = key => {
	const val = localStorage.getItem(key);

	const parsedVal = parseJSON(val);

	return parsedVal;
};

export const setLS = (key, val) => {
	const parsedVal = typeof val === "object" ? JSON.stringify(val) : val;

	localStorage.setItem(key, parsedVal);
};

export const getFileMeta = idToFind => {
	const allFiles = getLS("files");
	return allFiles.find(({ id }) => idToFind === id);
};

export const setFileMeta = (idToUpdate, newMetaObj) => {
	const allFiles = getLS("files");
	const index = allFiles.findIndex(({ id }) => idToUpdate === id);

	if (index === -1) {
		console.warn(`Could not find file ${id}`);
		return;
	}

	allFiles[index] = newMetaObj;

	setLS("files", allFiles);
};

export const setFile = (id, text) => {
	const oldMeta = getFileMeta(id) || {};

	// Update file text.
	setLS(id, text);

	// Update file meta.
	const newMeta = {
		...oldMeta,
		modified: Date.now()
	}
	setFileMeta(id, newMeta);
};

export const getFile = id => {
	// File text.
	const text = getLS(id);

	// File meta.
	const meta = getFileMeta(id);
	if (meta) {
		const { name } = meta;

		return {
			text,
			name
		};
	} else {
		console.warn(`Could not find file ${id}`);
		return {};
	}
};

