public class ArrayExamples {
  /* post: return true if list is sorted in ascedning order, false otherwise */
  public static boolean isAscending( int[] list ) { boolean ascending = true;
    int index = 1;
    while( ascending && index < list.length ) {
      assert index >= 0 && index < list.length;
      ascending = (list[index - 1] <= list[index]);
      index++;
    }
    return ascending;
  }

  public static void showList(int[] list) {
    for(int i = 0; i < list.length; i++)
      System.out.print( list[i] + " " );
    System.out.println();
  }
}