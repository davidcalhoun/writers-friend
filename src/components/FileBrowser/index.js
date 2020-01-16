import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./index.css";
import uuidv4 from "uuid/v4";

import {
	getFile,
	setFile,
	getLS,
	setLS,
	getFileMeta,
	setFileMeta
} from "../../utils";

const initialValue = [
	{
		type: "paragraph",
		children: [
			{ text: "This is editable " },
			{ text: "rich", bold: true },
			{ text: " text, " },
			{ text: "much", italic: true },
			{ text: " better than a " },
			{ text: "<textarea>", code: true },
			{ text: "!" }
		]
	}
];

function Filename(props) {
	const { isSelected, isEditing, id, name, onFileSelect, onNameChange, onEditBlur } = props;

	const className = `${styles.file} ${
		isSelected ? styles.fileSelected : ""
	}`;

	if (isEditing) {
		return (
			<li key={id}>
				<FilenameInput
					name={name}
					id={id}
					onNameChange={onNameChange}
					onEditBlur={onEditBlur}
				/>
			</li>
		);
	}

	return (
		<li
			className={className}
			onClick={onFileSelect.bind(null, id)}
		>
			{name}
		</li>
	);
}

function FilenameInput(props) {
	const [value, setValue] = useState("");
	const inputEl = useRef(null);

	const { id, name, onNameChange, onEditBlur } = props;

	useEffect(() => {
		setValue(name);

		inputEl.current.focus();
	}, []);

	function handleChange(event) {
		setValue(event.target.value);
	}

	function handleNameChangeSubmit(event) {
		event.preventDefault();

		onNameChange(id, value);
	}

	function handleFilenameKeyDown(event) {
		const escapeKey = event.keyCode === 27;

		if (escapeKey) {
			onEditBlur(id);
		}
	}

	return (
		<form onSubmit={handleNameChangeSubmit}>
			<input
				ref={inputEl}
				type="text"
				onChange={handleChange}
				onBlur={onEditBlur.bind(null, id)}
				onKeyDown={handleFilenameKeyDown}
				value={value}
				className={styles.fileEditInput}
			/>
		</form>
	);
}

export default function(props) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [files, setFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState("");
	const [nameEdit, setNameEdit] = useState({});
	const { onFileSelect } = props;

	useEffect(() => {
		const files = getFilesLS();
		setFiles(files);

		// Open the first file.
		handleFileSelect(files[0].id);
	}, []);

	function getFilesLS() {
		let allFiles = getLS("files");
		if (!allFiles) {
			allFiles = initLocalStorage();
		}

		if (allFiles.length === 0) {
			return;
		}

		return allFiles;
	}

	function handleToggleExpand() {
		setIsExpanded(!isExpanded);
	}

	function createFile(filename) {
		const id = uuidv4();

		// File text.
		setLS(id, initialValue);

		// File meta.
		const curFiles = getLS("files");
		const newFiles = [
			{ id, name: filename, created: Date.now(), modified: Date.now() },
			...curFiles
		];
		setLS("files", newFiles);

		setFiles(newFiles);

		return {
			createdId: id,
			newFiles
		};
	}

	function initLocalStorage() {
		// Don't overwrite existing.
		if (getLS("files")) {
			return getLS("files");
		}

		setLS("files", []);

		const initialFiles = [];
		const { newFiles } = createFile("New Document");

		return newFiles;
	}

	function handleCreateNew(filename) {
		const { newFiles, createdId } = createFile(filename);

		setFiles(newFiles);

		onFileSelect(createdId);
	}

	function handleFileSelect(id) {
		if (id === selectedFile) {
			// Already selected, so enter filename editing mode.
			const { name } = getFileMeta(id);

			setNameEdit({
				id,
				text: name
			});
		} else {
			// Open new file.
			onFileSelect(id);
			setSelectedFile(id);
		}
	}

	function handleNameChange(id, name) {
		const oldMeta = getFileMeta(id);
		const newMeta = {
			...oldMeta,
			name
		};

		setFileMeta(id, newMeta);

		setNameEdit({});

		const files = getFilesLS();
		setFiles(files);
	}

	function handleEditBlur(id) {
		setNameEdit({});
	}

	let containerClass = styles.container;
	containerClass +=
		" " + (isExpanded ? styles.expandOpen : styles.expandClosed);

	return (
		<div className={containerClass}>
			<div className={styles.expand}>
				<button onClick={handleCreateNew.bind(null, "New Document")}>
					Create New
				</button>
				<button onClick={handleToggleExpand}>
					{isExpanded ? "Close" : "Open"}
				</button>
			</div>
			<ul className={styles.files}>
				{files.map(({ id, name }) => {
					return (
						<Filename
							key={id}
							id={id}
							name={name}
							isSelected={selectedFile === id}
							isEditing={nameEdit.id === id}
							onFileSelect={handleFileSelect}
							onNameChange={handleNameChange}
							onEditBlur={handleEditBlur}
						/>
					);
				})}
			</ul>
		</div>
	);
}
