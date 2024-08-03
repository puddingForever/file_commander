const fs = require("fs/promises");

// open ()  file descriptor (number assigned to a file , same as id), when we open the file ,
// we are saving number(file descriptor) to our memory
// read  or  write

(async () => {
  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    let existingFileHandle;
    try {
      existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();
      return console.log(`The file ${path} already exists`);
    } catch (err) {
      // no file , we have to create a file
      const newFileHandle = await fs.open(path, "w");
      console.log("new file created");
      newFileHandle.close();
    }
  };

  const deleteFile = (path) => {
    console.log(`Deleting ${path}`);
    fs.unlink(path, (err) => {
      if (err) {
        console.error("error");
        return;
      }

      console.log("File has successfully deleted");
    });
  };

  const renameFile = (oldPath, newPath) => {
    console.log(`Rename ${oldPath} to ${newPath}`);
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error("error");
        return;
      }
      console.log("file has successfully renamed");
    });
  };

  const addToFile = (path, content) => {
    console.log(`Adding to the ${path} and ${content}`);
    fs.appendFile(path, content, (err) => {
      if (err) {
        console.error("error");
        return;
      }

      console.log("content has successfully added to the file");
    });
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);

    const command = buff.toString("utf-8");

    // create a file:
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    // delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    //rename the file <path> to <path>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx); // start <Path>
      const newFilePath = command.substring(_idx + 4);

      renameFile(oldFilePath, newFilePath);
    }

    // add to the file <path> this content: <content>

    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx); // path
      const fileContent = command.substring(_idx + 15);

      addToFile(filePath, fileContent);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
