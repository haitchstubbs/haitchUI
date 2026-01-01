export function composeEventHandlers<E>(theirHandler: ((event: E) => void) | undefined, ourHandler: (event: E) => void) {
	return (event: E) => {
		theirHandler?.(event);
		ourHandler(event);
	};
}