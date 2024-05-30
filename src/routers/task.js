
const express = require('express')
const Task = require('../models/task')
const auth = require('../middlerware/auth')
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.send(task);
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/tasks', auth , async (req, res) => {
    try{
            await req.user.populate('tasks')
            res.status(200).send(req.user.tasks);
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/tasks/:id', auth , async (req, res) =>{
    const _id = req.params.id;
    try{
       const task =  await  Task.findOne({_id, owner: req.user.id});
       if(!task){
        res.status(404).send();
    }
    res.send(task)
    }catch(e){
        res.send(e)
    }
   
})

router.patch('/task/:id', async(req,res) =>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'});
    }
    const _id = req.params.id;
    try{
        const task  = await Task.findById(_id);
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task);
    }catch(e){
        res.status(400).send(e)
    } 
})

router.delete('/task/:id', async (req, res) =>{
    const _id = req.params.id;
    try{
        const task  = await Task.findByIdAndDelete(_id);
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }

        res.send(task)
    }catch(e){
        res.send(e)
    }

})

module.exports = router;