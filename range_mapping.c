#include <stdio.h>

int mapping(int in_r1,int in_r2,int ot_r1,int ot_r2,int inpu)
{
    int output = ot_r1 + ((ot_r2 - ot_r1) * (inpu - in_r1) / (in_r2 - in_r1));
    return output;
}

int main()
{
    int in_r1,in_r2,ot_r1,ot_r2;
    int inpu,outpu;

    printf("Enter in_r1: ");
    scanf("%d",&in_r1);

    printf("Enter in_r2: ");
    scanf("%d",&in_r2);

    printf("Enter ot_r1: ");
    scanf("%d",&ot_r1);

    printf("Enter ot_r2: ");
    scanf("%d",&ot_r2);

    printf("\nEnter Input: ");
    scanf("%d",&inpu);

    //output = ot_r1 + ((ot_r2 - ot_r1) * (input - in_r1) / (in_r2 - in_r1));

   outpu = mapping(in_r1,in_r2,ot_r1,ot_r2,inpu);
   printf("%d",outpu);

    return 0;
}
