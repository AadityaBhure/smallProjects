#include <stdio.h>

int main()
{
    int in_r1,in_r2,ot_r1,ot_r2;
    int input,output;

    printf("Enter in_r1: ");
    scanf("%d",&in_r1);

    printf("Enter in_r2: ");
    scanf("%d",&in_r2);

    printf("Enter ot_r1: ");
    scanf("%d",&ot_r1);

    printf("Enter ot_r2: ");
    scanf("%d",&ot_r2);

    printf("\nEnter Input: ");
    scanf("%d",&input);

    output = ot_r1 + ((ot_r2 - ot_r1) * (input - in_r1) / (in_r2 - in_r1));

    printf("\nRange Output is: %d",output);

    return 0;
}