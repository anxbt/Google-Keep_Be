import express, { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { random } from './utils';
import { PrismaClient } from '@prisma/client'
const app = express();
app.use(express.json());

const prisma = new PrismaClient();


// const testToken = jwt.sign({ test: "data" }, "secret");
// console.log("Test token:", testToken);

// jwt.verify(testToken, "secret", (err, decoded) => {
//     if (err) {
//         console.log("Test verification failed:", err);
//     } else {
//         console.log("Test verification succeeded:", decoded);
//     }
// });

const verifyToken = (req: Request, res: Response, next: NextFunction) => {


    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader); // Debugging log


    // const token = req.headers.authorization?.split(" ")[1];
    const token = req.headers['authorization'];

    if (!token) {
        console.log("No token provided");
        res.status(401).json({ message: "Access denied, no token provided" });
        return;
    }

    jwt.verify(token, "secret", (err, decoded) => {
        if (err) {
            console.log("No token provided");

            return res.status(400).json({ message: "Invalid token", });
        }
        // Attach user info to request for downstream handlers
        console.log("Decoded Token:", decoded);
        (req as any).user = decoded;
        next();
    });
};

// mongoose.connect(uri)
// .then(()=>{
//     console.log("Connected to MongoDB");    
// })
// .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
// });


// const userSchema = new mongoose.Schema({
//     username:String,
//     password:String
// })

// const postSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     type: { type: String, enum: ["document", "tweet", "youtube", "link"], required: true },
//     link: { type: String},
//     tags: { type: [String], default: [] }
// })

// const LinkSchema = new mongoose.Schema({
//     hash:String,
//     userId:{type:mongoose.Types.ObjectId, ref:"User"},
// })

// // Create a User model based on the schema
// const UserModel = mongoose.model("User",userSchema);

// const PostModel = mongoose.model("Post", postSchema);

// const LinkModel = mongoose.model("Link", LinkSchema);

// @ts-ignore
app.get("/",  (req: Request, res: Response) => {
    return res.status(200).json({ message: "Welcome to the API" });
});


app.post("/signup", async (req: Request, res: Response): Promise<any> => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username: req.body.username } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await prisma.user.create({
            data: {
                username: req.body.username,
                password: req.body.password
            }
        });

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Error creating user:", error);
    }
});

app.post("/signin", async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await prisma.user.findUnique(
            { where: { username: req.body.username } }
        )
        if (!user) {
            return res.status(401).json({ message: "Invalid username" });
        }

        const isPasswordValid = user.password === req.body.password;
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ username: user.username, id: user.id.toString() }, "secret");
        res.status(200).json({ message: "Login successful", token })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post("/post", verifyToken, async (req: Request, res: Response): Promise<any> => {
    const { type, link, title, content, tags,shareable } = req.body;

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
            }
        })
        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }

})

app.get("/post", verifyToken, async (req: Request, res: Response): Promise<any> => {

    // @ts-ignore
    const userId = req.body.user?.id;
    //const userId = req.userId;
    const content = await prisma.post.findMany({
        where: {
            id: userId, // Filter posts by the user's ID
        },
    })
    res.status(200).json(content);
})

app.delete("/post", verifyToken, async (req: Request, res: Response): Promise<any> => {
    const { contentId } = req.body; // Get contentId from the request body

    if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
    }

    try {
        // Delete the post with the specified ID
        await prisma.post.delete({
            where: { id: contentId },
        });

        res.json({
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/share", verifyToken, async (req: Request, res: Response): Promise<any> => {
    const share = req.body.share;

    if (share) {
        // Ensure userId is an integer
        const userId = parseInt((req as any).user?.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const existingLink = await prisma.link.findFirst({
            where: { userId: userId },
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash,
                message: "Link already exists"
            })
            return;
        }

        const hash = random(10);
        await prisma.link.create({
            data: {
                userId: (req as any).user?.id,
                hash: hash,
            },
        });
        res.json({
            hash: hash,
            message: "Link created successfully"
        })
    } else {
        await prisma.link.deleteMany({
            where: { userId: (req as any).user?.id },
        });

        res.json({
            message: "Link deleted successfully"
        })
    }

})

app.get("/:shareLink", async (req: Request, res: Response): Promise<any> => {

    const hash = req.params.shareLink;

    try{

    const link = await prisma.link.findFirst({
         where: { hash: hash },
    //      where: {
    //     userId: link.userId,
    //     shareable: true, // Only include shareable posts
    // },

    })
    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

 // Fetch the posts associated with the user
    // If your Post model has a userId field, use it as shown below:
    // const userPosts = await prisma.post.findMany({
    //         where: { userId: link.userId },
    //     });

    // Otherwise, if you want to fetch posts by id, keep as is or remove if not needed.
    // const userPosts = await prisma.post.findMany({
    //         where: { id: link.userId },
    //     });


    console.log(link);

    // Fetch the user associated with the link
        const user = await prisma.user.findUnique({
            where: { id: link.userId },
        });

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }
      // Fetch only shareable posts for the user
        const shareableContent = await prisma.post.findMany({
            where: {
                shareable: true, // Only include shareable posts
                // Add other valid filters here if needed, e.g., id: link.userId
            },
        });

    res.json({
        username: user.username,
        content: shareableContent,
    })
 } catch (error) {
        console.error("Error in /:shareLink endpoint:", error);
        res.status(500).json({ message: "Internal server error" });
    }

})

app.patch("/post/:id/shareable", verifyToken, async (req: Request, res: Response): Promise<any> => {
    const postId = parseInt(req.params.id, 10);
    const { shareable } = req.body;

    if (isNaN(postId) || typeof shareable !== "boolean") {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        // Update the shareable status of the post
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { shareable: shareable },
        });

        res.json({
            message: "Post updated successfully",
            post: updatedPost,
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});



