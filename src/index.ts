import express, { Request, Response ,NextFunction} from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { random } from './utils';

const app = express();
app.use(express.json());

const uri = "mongodb+srv://anubrat23:5432@cluster0.jj03c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    const token =req.headers['authorization'];

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

mongoose.connect(uri)
.then(()=>{
    console.log("Connected to MongoDB");    
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});


const userSchema = new mongoose.Schema({
    username:String,
    password:String
})

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["document", "tweet", "youtube", "link"], required: true },
    link: { type: String},
    tags: { type: [String], default: [] }
})

const LinkSchema = new mongoose.Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId, ref:"User"},
})

// Create a User model based on the schema
const UserModel = mongoose.model("User",userSchema);

const PostModel = mongoose.model("Post", postSchema);

const LinkModel = mongoose.model("Link", LinkSchema);

 // @ts-ignore
app.get("/",verifyToken, (req: Request, res: Response) => {
    return res.status(200).json({message: "Welcome to the API"});   
});


app.post("/signup", async (req:Request,res:Response): Promise<any>   => {
 const username= req.body.username;
 const password= req.body.password;

 if (!username || !password){
    return res.status(400).json({message: "Username and password are required"});
    }

 try{
    const existingUser = await UserModel.findOne({ username:req.body.username });
    if(existingUser){
        return res.status(400).json({message:"User already exists"});
    }

    const newUser = new UserModel({
        username: req.body.username,
        password: req.body.password
    })

    await newUser.save();
    res.status(201).json({message: "User created successfully"});

 }catch (error) {
    console.error("Error creating user:", error);   
 }
});

app.post("/signin", async (req: Request, res: Response): Promise<any>  => {
try{
    const user = await UserModel.findOne({ username: req.body.username})
    if(!user){
        return res.status(401).json({message: "Invalid username"});
    }

    const isPasswordValid = user.password === req.body.password;
    if(!isPasswordValid){   
        return res.status(401).json({message: "Invalid password"});
    }

    const token =jwt.sign({username:user.username,  id: user._id.toString()}, "secret");
    res.status(200).json({message:"Login successful", token})

}catch(error){
    res.status(500).json({message: "Internal server error"});
}
})

app.post("/post", verifyToken ,async (req: Request, res: Response): Promise<any>  => {
    const {type, link, title, content, tags} = req.body;

    const post = new  PostModel({
        type,
        link,
        title,
        content,
        tags
    })
 
    try{
        await post.save();
        res.status(201).json({message: "Post created successfully", post});
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }

})

app.get("/post",verifyToken, async (req: Request, res: Response): Promise<any>  => {
    
    // @ts-ignore
    const userId = req.body.user?.id;
    //const userId = req.userId;
    const content =await PostModel.find({
        userId: userId
    })
    res.status(200).json(content);
})

app.delete("/post",verifyToken, async (req: Request, res: Response): Promise<any>  => {
    
     const { contentId } = req.body; // Get contentId from the request body
    const userId = req.body.user?.id; // Get userId from the verifyTok middleware

    if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
    }
        await PostModel.deleteMany({
        userId: userId
    })

     res.json({
        message: "Deleted"
 
    })
})


app.post("/share", verifyToken ,async (req: Request, res: Response): Promise<any>  => {
    const share=req.body.share;

    if(share){
        const existingLink=await LinkModel.findOne({
            userId: (req as any).user?.id,
        })

        if(existingLink){
        res.json({
            hash: existingLink.hash,
            message: "Link already exists"
        })
        return;
        }

        const hash =random(10);
        await LinkModel.create({
            userId: (req as any).user?.id,
            hash: hash
        })
        res.json({
            hash: hash,
            message: "Link created successfully"
        })
    }else{
        await LinkModel.deleteMany({
            userId: (req as any).user?.id,
        });

        res.json({
            message: "Link deleted successfully"
        })
    }

})

app.get("/:shareLink" ,async (req: Request, res: Response): Promise<any>  => {

const hash = req.params.shareLink;

const link =await LinkModel.findOne({
    hash: hash,
    
})
if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    //userId
    const content =await PostModel.find({
    userId: link.userId
    })

    console.log(link);

     const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })
    console.log("Content shared successfully", content);


})



app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});



