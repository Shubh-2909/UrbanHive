export const calculatePercentage = (thisMonth , lastMonth) => {

   if(lastMonth === 0) {
    return thisMonth*100;
   }
   const percent = ((thisMonth)/lastMonth) * 100;
   return Number(percent.toFixed(0));
}