# Directory Scanning using Nest.js

A NestJS-based project for scanning directories and their subdirectories in parallel using worker threads. This project demonstrates how to efficiently scan large directory structures while leveraging multi-core CPUs for improved performance.

---

## Features

- **Parallel Directory Scanning**: Utilizes worker threads to scan directories in parallel, ensuring optimal performance.
- **Depth-First Search (DFS) and Breadth-First Search (BFS)**: Supports both DFS and BFS approaches for directory traversal.
- **Worker Pool**: Uses `workerpool` library to manage a pool of worker threads for concurrent scanning.
- **File Metadata**: Retrieves metadata for each file/directory, including:
  - File name
  - File path
  - File size
  - Last modified time
  - Whether it's a file or directory

---

## Workflow

![workflow](./src/public/workflow.png)

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [NestJS CLI](https://docs.nestjs.com/cli/overview) (recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/) (package manager)

---

## Installation

1\. Clone the repository:

```bash
git clone https://github.com/himanegi/dirscan.git
cd dirscan
```

2\. Install dependencies:

```bash
npm install
```

3\. Build the project:

```bash
npm run build
```

---

## Usage

### Running the Project

1\. Start the NestJS application:

```bash
npm run start
```

2\. The application will start a server on `http://localhost:3000`.

---

### Scanning a Directory

To scan a directory, send a GET request to the `/scan` endpoint with `/dfs`, `/bfs` or `/sync` route.

#### Example Request

```bash
curl -X GET http://localhost:3000/scan/dfs
curl -X GET http://localhost:3000/scan/bfs
curl -X GET http://localhost:3000/scan/sync
```

#### Example Response

```json
[
  {
    "file": "file1.txt",
    "filePath": "test-dir/file1.txt",
    "size": 1024,
    "modifiedTime": "2023-10-01T12:34:56.000Z",
    "isDirectory": false,
    "isFile": true
  },

  {
    "file": "dir1",
    "filePath": "test-dir/dir1",
    "size": 4096,
    "modifiedTime": "2023-10-01T12:34:56.000Z",
    "isDirectory": true,
    "isFile": false
  }
]
```

---

### Configuration

You can configure the worker pool settings in the `ScanService` class:

```typescript
this.pool = workerpool.pool(join(__dirname, 'scan-worker'), {
  maxWorkers: 5, // Adjust the number of workers
});
```

---

## Project Structure

```

dirscan/

├── src/
│   ├── scan/
│   │   ├── scan.service.ts       # Service for directory scanning
│   │   ├── scan.controller.ts    # Controller for handling scan requests
│   │   ├── scan.worker.ts        # Worker script for parallel scanning
│   ├── app.module.ts             # Root module
│   ├── main.ts                   # Application entry point
├── test-dir/                     # Example directory for testing
├── README.md                     # This file
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration

```

---

## Performance

The project uses worker threads to parallelize directory scanning, making it suitable for large directory structures. You can adjust the number of workers in the worker pool to optimize performance based on your system's CPU cores.

---

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1\. Fork the repository.

2\. Create a new branch for your feature or bugfix.

3\. Commit your changes and push to the branch.

4\. Submit a pull request.

---

## Acknowledgments

- [NestJS](https://nestjs.com/) for the awesome framework.

- [workerpool](https://github.com/josdejong/workerpool) for simplifying worker thread management.

---

Enjoy scanning directories with NestJS! 🚀
