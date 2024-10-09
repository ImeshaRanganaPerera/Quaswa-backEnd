import multer from 'multer';
import path from 'path';

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../uploads/'); // Folder to store uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // File name with a timestamp
    }
});

// Initialize multer with the defined storage and file limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Limit to 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpg, jpeg, png)')); // Error if not a valid image
        }
    }
}).fields([
    { name: 'shopImage', maxCount: 1 },
    { name: 'nicImage', maxCount: 1 },
    { name: 'brImage', maxCount: 1 }
]);

// Export the 'upload' object
export default upload;
