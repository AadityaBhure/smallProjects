#include <stdio.h>
#include <stdlib.h>

int main()
{
    FILE *fptr;
    char filename[100],filetext,filesave[100];
    int i=0;
    
    //if file is in another folder, add complete paths
    printf("FILE READER\nPlease enter the name of the file you want to read (with extension): "); 
    scanf("%s",filename);

    fptr = fopen(filename,"r");

    if(fptr == NULL)
    {
        perror("ERROR!");
    }
    else
    {
        do {
            // filetext = fgetc(fptr);
            filesave[i] = fgetc(fptr);
            i++;
        } while (filetext != EOF);
        filesave[i] = '\0';
        printf("%s",filesave);
        fclose(fptr);
    }

    return 0;
}