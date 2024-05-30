const express = require('express')
const multer = require('multer')
const User  = require('../models/user')
const router = new express.Router()
const auth = require('../middlerware/auth')
router.post('/users', async (req, res) =>{
    const user  = new User(req.body)
     try{

        await user.save();
        const token = await user.generateAuthToken()
        res.status(200).send({user, token});
     } catch(e){
        res.send(e)
     }

})

router.post('/user/login', async (req, res) =>{
    try{
        const user  = await User.findBycredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token})
    }catch(e){
    return res.status(400).send();
}
        
})

router.post('/users/logout', auth, async(req,res) => {
        try{
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })

            await req.user.save()
            res.send();
        }catch(e){
            res.status(500).send()
        }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens= []
        await req.user.save();
        res.send()
    }catch(e){
        res.status(500).send()

    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
    
})

router.get('/users/:id',  async (req, res) =>{
    const _id = req.params.id;
    try{
            const user  = await User.findById({_id});
            if(!user){
                return res.status(404).send();
            }
            res.send(user)
    }catch(e){
        res.status(400).send(e)
    }  
})

router.patch('/user/me', auth, async(req,res) =>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'});
    }
    try{
        
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.status(200).send(req.user);
    }catch(e){
        res.status(400).send(e)
    } 
})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    dest: 'avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatars'), async (req, res) => {
    try {
        
        req.user.avatar = req.file.filename;
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
}, (error, req, res, next) => {
    // Handle file upload errors
    res.status(400).send({ error: error.message });
});


router.delete('/users/me/avatar', auth, async (req, res) =>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user)
})
module.exports  = router