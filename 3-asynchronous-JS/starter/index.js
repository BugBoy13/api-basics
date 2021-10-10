const fs = require('fs')
const superagent = require('superagent')

const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

const writeFilePro = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, err => {
            if (err) reject(err)
            resolve()
        })
    })
}

const getDogPic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log((`Breed: ${data}`));

        const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res2Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res3Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

        const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
        const imgs = all.map(el => el.body.message)
        console.log(imgs);

        await writeFilePro('dog-img.txt', imgs.join('\n'));
        console.log('File saved');
    } catch (error) {
        console.error(error);
        throw(error)
    }
    return '2. Ready'
}

(async () => {
    try {
        console.log('1. Will get dog pics');
        const res = await getDogPic();
        console.log(res);
        console.log('3. Done getting pics');
    } catch (error) {
        console.error(error.message);
    }
})();

/*
console.log('1. Will get dog pics');
getDogPic()
    .then(res => {
        console.log(res);
        console.log('3. Done getting pics');
    })
    .catch(err => {
        console.error(err.message);
    })
*/

/*
readFilePro(`${__dirname}/dog.txt`)
    .then(data => {
        console.log((`Breed: ${data}`));
        return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
    }).then(res => {
        console.log(res.body.message);
        return writeFilePro('dog-img.txt', res.body.message);
    })
    .then(() => {
        console.log('File saved');
    })
    .catch(err => {
        console.log(err.message);
    })
*/