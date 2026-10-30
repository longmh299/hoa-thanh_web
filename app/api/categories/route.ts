import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
  const cats=await prisma.category.findMany({orderBy:[{order:"asc"},{name:"asc"}], select:{id:true,slug:true,name:true}});
  return NextResponse.json({items: cats});
}
