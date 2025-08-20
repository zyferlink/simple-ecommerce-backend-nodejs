function logSeparator(label = "") {
  const line = "-".repeat(30);
  console.log(`\n${line} ${label} ${line}\n`);
}

export { logSeparator };