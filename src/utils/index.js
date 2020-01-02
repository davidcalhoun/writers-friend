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
		}
	}
	useEffect(init, []);

	return [time, setTime];
}