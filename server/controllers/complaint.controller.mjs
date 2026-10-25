import complaints from "../models/complaints.mjs";
import studentProfile from "../models/studentProfile.mjs";
import Hostel from "../models/hostel.mjs";


export const createComplaint=async(req,res)=>{
    try {
        const {complaintName,description,location,category,photos}=req.body;
        if(!complaintName||!description||!location||!category){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const student = await studentProfile.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(400).json({
                success: false,
                message: "Please complete your student profile before submitting a complaint."
            });
        }
        const complaint = await complaints.create({
            userId: req.user._id,
            complaintName,
            description,
            location,
            category,
            hostelId: student.hostelId,
            photos: photos || [],
            status: "pending",
        });
        return res.status(201).json({
            success:true,
            message:"Complaint Created Successfully",
            complaint
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:error.message
        })
    }
}

export const viewComplaints=async(req,res)=>{
    try {
        const { status, category, hostelName, page = 1, limit = 10 } = req.query;
        const filter={};
        if(status) filter.status=status
        if(category) filter.category=category
        if(hostelName){
            const hostel=await Hostel.findOne({name:hostelName})
            if(!hostel){
                return res.status(404).json({
                    success:false,
                    message:"Invalid Hostel"
                })
            }
            filter.hostelId=hostel._id
        }

        const skip=(page-1)*limit
        const allComplaints = await complaints.find(filter)
            .populate("userId", "name email")
            .populate("hostelId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await complaints.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            complaints: allComplaints
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}

export const resolveComplaint=async(req,res)=>{
    try{
        const {id}=req.params
        const {adminRemarks}=req.body
        const complaintData=await complaints.findById(id)
        if(!complaintData){
            return res.status(404).json({
                success:false,
                message:"Complaint not found"
            })
        }
        complaintData.status='resolved'
        complaintData.adminRemarks=adminRemarks
        complaintData.resolvedAt=Date.now()
        await complaintData.save()
        res.status(200).json({
            success:true,
            message:"Complaint Resolved Successfully"
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: error.message
        })
    }
}

export const complaintStatus=async(req,res)=>{
    try{
        const{id}=req.params
        const {status}=req.body
        const complaintData=await complaints.findById(id)
        if(!complaintData){
            return res.status(404).json({
                success:false,
                message:"Complaint not found"
            })
        }
        const validStatus = ["pending", "in-progress", "resolved", "rejected"]
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            })
        }
        complaintData.status=status
        if(status!=="resolved"){
            complaintData.adminRemarks=null
            complaintData.resolvedAt=null
        }
        if (status === 'resolved') {
            complaintData.resolvedAt = Date.now()
        }
        await complaintData.save()
        return res.status(200).json({
            success:true,
            message:"Status Updated Successfully"
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        })
    }
}

// ── KEY FIX: now reads the `status` query param for filtering ──────────────
export const viewStudentComplaints=async(req,res)=>{
    try {
        const { filter='mine', page=1, limit=10, status } = req.query;
        const query = {}

        if (filter === 'mine') {
            query.userId = req.user._id
        } else {
            // "all hostel" tab — scope to student's hostel
            const student = await studentProfile.findOne({ userId: req.user._id })
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Please complete your profile first"
                })
            }
            query.hostelId = student.hostelId
        }

      
        if (status) {
            if (status === 'active') {
                query.status = { $in: ['pending', 'in-progress'] }
            } else {
                query.status = status
            }
        }

        const skip = (page - 1) * limit

        const allComplaints = await complaints.find(query)
            .populate("userId", "name email")
            .populate("hostelId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        const total = await complaints.countDocuments(query)

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            complaints: allComplaints
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}

export const deleteStudentComplaints=async(req,res)=>{
    try {
        const {id}=req.params
        const complaint=await complaints.findById(id)
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint not found"
            })
        }
        if(complaint.userId.toString()!==req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"You can only delete your own complaints"
            })
        }
        if(complaint.status!=='pending'){
            return res.status(400).json({
                success:false,
                message: `Cannot delete a complaint with status "${complaint.status}"`
            })
        }
        await complaints.findByIdAndDelete(id)
        return res.status(200).json({
            success:true,
            message:"Complaint deleted Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        })
    }
}

export const reopenStudentComplaints=async(req,res)=>{
    try {
        const {id}=req.params;
        const { reason } = req.body;
        const complaint=await complaints.findById(id);
        if(!complaint){
            return res.status(404).json({
                success:false,
                message:"Complaint not found"
            })
        }
        if(complaint.userId.toString()!==req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"You can only modify your own complaints"
            })
        }
        if(complaint.status!=='resolved'&&complaint.status!=='rejected'){
            return res.status(400).json({
                success:false,
                message: "Only resolved or rejected complaints can be reopened"
            })
        }

        complaint.status = 'pending'
        complaint.reopenCount += 1
        complaint.reopenAt = Date.now()
        complaint.adminRemarks = null
        complaint.resolvedAt = null

        complaint.updates.push({
            message: reason || "Complaint reopened by student",
            userId: req.user._id
        })

        await complaint.save()

        return res.status(200).json({
            success: true,
            message: "Complaint reopened successfully",
            complaint
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        })
    }
}
