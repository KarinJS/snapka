import decompress from 'decompress'

export const extract = async (
  zipPath: string,
  options: {
    /** The path to the directory where the extracted files are written */
    dir: string
    /** Directory Mode (permissions), defaults to `0o755` */
    defaultDirMode?: number
    /** File Mode (permissions), defaults to `0o644` */
    defaultFileMode?: number
  }
) => {
  const defaultDirMode = options.defaultDirMode ?? 0o755
  const defaultFileMode = options.defaultFileMode ?? 0o644

  const files = await decompress(zipPath, options.dir, {
    map: (file) => {
      // Set default permissions if not specified
      if (file.type === 'directory' && !file.mode) {
        file.mode = defaultDirMode
      } else if (file.type === 'file' && !file.mode) {
        file.mode = defaultFileMode
      }
      return file
    },
  })

  return files
}
