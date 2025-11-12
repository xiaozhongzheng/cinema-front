import pcaData from './pca.json'
const newData = {...pcaData} as any

const provinceList = Object.keys(newData).map(key => key)

export const provinceOptions = provinceList.map(val => ({label: val,value: val}))

export const getCityDataByProvince = (province: string) => {
    return newData[province] 
}

export const getCityOptions = (cityData: any) => {
    return Object.keys(cityData).map(key => ({label: key,value: key}))
}

export const getAreaByProvinceAndCity = (province: string,city: string) => {
    return newData?.[province]?.[city]
}


