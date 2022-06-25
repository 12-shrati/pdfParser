const express = require('express')
const pdf = require('pdf-parse')
const multer = require('multer')
const aws = require('aws-sdk');

const app = express();
const router = express.Router()

app.use(multer().any())

app.use('/', router);

aws.config.update(
  {
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
  }
)

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" })

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "pdf/" + file.originalname,
      Body: file.buffer
    }

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ "error": err })
      }
      console.log(data)
      return resolve(data.Location)
    }
    )
  }
  )
}

router.get("/", function (req, res) {
  res.send("pdf parsing....")
})

router.post('/pdfUpload', async function (req, res) {
  let files = req.files
  if (files && files.length > 0) {
    var uploadedFileURL = await uploadFile(files[0])
    pdf(uploadedFileURL).then(function (data) {
      res.json({ pdfText: data })
    }).catch(Error);
  }
  else {
    return res.send({ status: false, message: "profileImage is required"})
  }
})



app.listen(3000, function () {
  console.log('Express app running on port ' + 3000)
});